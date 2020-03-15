function PMT(ir, np, pv, fv, type) {
    /*
     * ir   - interest rate per month
     * np   - number of periods (months)
     * pv   - present value
     * fv   - future value
     * type - when the payments are due:
     *        0: end of the period, e.g. end of month (default)
     *        1: beginning of period
     */
    var pmt, pvif;

    fv || (fv = 0);
    type || (type = 0);

    if (ir === 0)
        return -(pv + fv)/np;

    pvif = Math.pow(1 + ir, np);
    pmt = - ir * pv * (pvif + fv) / (pvif - 1);

    if (type === 1)
        pmt /= (1 + ir);

    return pmt;
}

function NPER(rate, payment, present, future, type) {
  var type = (typeof type === 'undefined') ? 0 : type;
  var future = (typeof future === 'undefined') ? 0 : future;
  var num = payment * (1 + rate * type) - future * rate;
  var den = (present * rate + payment * (1 + rate * type));
  return Math.log(num / den) / Math.log(1 + rate);
}

const rules = [
  {on: 0, setRate: 0.03/12},
  {on: 0, setPeriods : 360},
  {on: 120, setRate: 0.06/12},
  {on: 4, setPayment : -1200},
  {every: 1 , extra: -1500, periodBias: 1},
  // {every: 4 , extra: -500, periodBias: 0},
  // {only: 4 , extra: -1000, periodBias: 0}
]

const parseRules = (currentPeriod, previousSchedule) => {
  const highestOn = (answer, current) => {
    return current.on >= answer.on || typeof(answer.on ==='undefined') ? current : answer
  };
  const principleStart = previousSchedule.remainingPrinciple;

  const relevantRules = rules.filter( rule => rule.on <= currentPeriod );
  
  //1. Get current rate - rule with setRate key and biggest on value
  const rateRule = relevantRules.filter( rule => typeof(rule.setRate) !== 'undefined')
    .reduce( highestOn, {setRate: 0})
    
  //2. Get current period - rule with setPeriods key and biggest on value
  const periodRule = relevantRules.filter( rule => typeof(rule.setPeriods) !== 'undefined')
    .reduce( highestOn, {});
  
  //3. Get current payment - rule with setPayment and biggest on value
  const paymentRule = relevantRules.filter( rule => typeof(rule.setPayment) !== 'undefined')
    .reduce( highestOn, {});
    
  //4. Get Extra payments
  const extraRules = rules.filter( rule => typeof( rule.extra ) !== 'undefined')
    .filter( rule => rule.only === currentPeriod || currentPeriod % rule.every === 0);
  
  // Compose
  const answer ={}
  Object.assign(answer, rateRule);
  
  // Determine proposed schedule ignoring extra payments
  const proposedSchedule = determineSchedule(
    previousSchedule,
    principleStart,
    rateRule,
    currentPeriod,
    periodRule,
    paymentRule
  );
  
  Object.assign(answer, proposedSchedule);

  // Calculate changes to proposals based on extra payments
  const extraSum = sumExtras(extraRules);
  Object.assign(answer, extraSum);
  const tp = totalPayment(
    rateRule.setRate,
    principleStart,
    answer.setPeriods,
    extraSum.extra,
    extraSum.periodBias
  );

  Object.assign(answer, tp);
  answer.interestCharged = principleStart * (answer.setRate)
  answer.capitalRepayed = answer.totalPayForPeriod + answer.interestCharged;
  answer.remainingPrinciple = principleStart + answer.capitalRepayed;
  answer.currentPeriod = currentPeriod;
  return answer;
}

function sumExtras(extras) {
  // sum of all absolute values f = extra/absSum, f*bias = biasFraction
  const tot = extras.reduce((tot, cur) => tot+Math.abs(cur.extra), 0)
  extras.forEach(extra => {
    extra.f = Math.abs(extra.extra / tot);
    extra.weightedBias = extra.f * extra.periodBias
  })
  const extraTotal = extras.reduce((tot, cur) => { 
    return {
      extra: tot.extra+cur.extra ,
      periodBias: tot.periodBias+cur.weightedBias
    }
  }, {extra: 0, periodBias: 0});
  return extraTotal;
}

function determineSchedule(
  establishedSchedule,
  principle,
  rateRule,
  currentPeriod,
  periodRule,
  paymentRule) {
  // There are 3 scenarios where a period/payment rule applies to the current period:
  // 1. The on value of the rule is the currentPeriod. This overrides all other rules
  // 2. The rule was recalculated during a prior period.
  // 3. The on value of the rule is < the currentPeriod.
  const periodOverrides = periodRule && currentPeriod === periodRule.on;
  const paymentOverrides = paymentRule && currentPeriod === paymentRule.on;
  const rateOverrides = rateRule && currentPeriod === rateRule.on;
  const rate = rateRule.setRate;

  if (establishedSchedule && !(periodOverrides || paymentOverrides || rateOverrides)) {
    // use established - most cases
    return {
      setPeriods: establishedSchedule.periodsNew - (currentPeriod - establishedSchedule.currentPeriod),
      setPayment: establishedSchedule.paymentsNew
    }
  } else {
    if (periodOverrides) {
      // recalculate pmt from rate, newPeriod, principle
      const proposedPeriods = periodRule.setPeriods - (currentPeriod - periodRule.on)
      return {
        setPeriods: proposedPeriods,
        setPayment: PMT(rate, proposedPeriods, principle)
      }
      
    } else {
      // recalculate nper from rate, principle, newPayment
      const proposedPeriods = NPER(rate, paymentRule.setPayment, principle) - (currentPeriod - paymentRule.on)
      return {
        setPeriods: proposedPeriods,
        setPayment: paymentRule.setPayment
      }
    }
  }
}

/**
* pstart: principle at start of this term including interest
* basePayments: payments not including extra payments
* basePeriods: periods not including extra payments
* extraAmount: Amount to repay
* extraBias: Towards 1 for more off periods, 0 for repayment size
* r: rate per period
*/
function totalPayment(r, pStart, basePeriods, extraAmount, extraBias) {
  const p2 = pStart + extraAmount
  const basePayments = PMT(r, basePeriods, pStart);
  const nMax = NPER(r, basePayments, p2) - basePeriods
  const nBiased = (nMax * extraBias) + basePeriods
  const mBiased = PMT(r, nBiased, p2)
  return { paymentsNew: mBiased, periodsNew: nBiased, totalPayForPeriod: extraAmount+mBiased }
}

// Notes so paymentsTotal is the recalculated global payments number
// Need to calculate totalPayedForPeriod separate (sum of extras and payments)

// const testpayment = totalPayment(0.0012, 225000, 360, -2000, .5)
// console.log("testpayment", testpayment)
// console.log("tot", testpayment.paymentsNew * testpayment.periodsNew + -2000)
let sched = {
  remainingPrinciple : 225000,
}
let period = 0;
let payments = 0;
tots = []
while (sched.remainingPrinciple > .001) {
  sched = parseRules(period, sched);
  tots.push(sched)
  payments+= sched.totalPayForPeriod;
  period +=1;
}
console.log(period);
console.log(sched);
console.log(payments + (225000 - sched.remainingPrinciple))

console.log(tots.map(s => s.currentPeriod))
console.log(tots.map(s => s.capitalRepayed))

console.log("Interest charged")
console.log(tots.reduce((acc,cur) => acc+cur.interestCharged, 0))
console.log("Interest payed")
console.log(tots.reduce((acc,cur) => acc+cur.totalPayForPeriod, 0) + 225000 - sched.remainingPrinciple)
console.log("Capital payed")
console.log(tots.reduce((acc,cur) => acc+cur.capitalRepayed, 0))
console.log("Total payed")
console.log(tots.reduce((acc,cur) => acc+cur.totalPayForPeriod, 0) + 225000 - sched.remainingPrinciple + tots.reduce((acc,cur) => acc+cur.capitalRepayed, 0))
console.log(tots.reduce((acc,cur) => acc+cur.totalPayForPeriod, 0))



