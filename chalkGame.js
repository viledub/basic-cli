const chalk = require('chalk');
const miles = 18;
const calculateFeet = miles => miles * 5280;

console.log(chalk.green('A'));
console.log(chalk.magenta('B'));
console.log(chalk.cyan('cyan'));
console.log(chalk.yellow('yellow'));
console.log(chalk.green(chalk.bgRed('|___')));
console.log(chalk.green(chalk.bgRed('___|')));
console.log(chalk.green(chalk.bgRed('|_'+chalk.bgYellow('_')+'_')));
console.log(chalk.green(chalk.bgRed('___|')));
console.log(chalk.green(chalk.bgRed('|___')));

console.log(chalk.supportsColor);


const readline = require('readline');

y=0
x=0
process.stdin.on('keypress', (str, key) => {
  if (key.ctrl && key.name === 'c') {
    process.exit();
  } else {
    if(key.name == 'down' && y < 9) {
		y+=1;
    } else if (key.name === 'up' && y>0 ){
		y-=1
    } else if (key.name === 'left' && x > 0) {
		x-=1;
    } else if (key.name === 'right' && x < 79) {
		x+=1
    } else if (key.name === 'x') {
		fire(x,y)
    }
  }
});
let proj=[]
function fire(cx, cy) {
	proj.push([cx+1,cy]);
}

//let c = j===i ? chalk.bgBlueBright(chalk.greenBright('-')) : j===i+2 ? ']' : j%2 === 0 && j < i && j > i-7 ? chalk.bgRedBright(chalk.yellow('{')): j%2 !== 0 && j < i && j > i-7 ? chalk.bgYellowBright(chalk.redBright('{')) : ' ';
async function mainLoop() {
  for(let i=0; true; i++) {
	const arr = [];
	for (let ey= 0; ey<5; ey++) {
		const b = []
		arr.push(b);
		for(let ex=0; ex<80; ex++) {
			if (ex === x && (ey*2) === y ) {    // 0,1 0,  2,3 1, 4,5 2
				b.push('^')
			} else if(ex === x && (ey*2)+1 === y) {
				b.push('_')
			} else {
				b.push(' ');
			}
		}
		console.log(b.join(''));
	}
	await sleep(60);
	console.clear();
  }
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
mainLoop();
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);