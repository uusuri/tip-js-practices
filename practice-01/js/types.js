"use strict";

function printResult(expression, value) {
  console.log(`${expression} ->`, value, `(тип: ${typeof value})`);
}

printResult('"8" + 2', "8" + 2);
printResult('"8" - 2', "8" - 2);
printResult('Number("8") + 2', Number("8") + 2);
printResult('"12" > "3"', "12" > "3");
printResult('12 === "12"', 12 === "12");
printResult('Number("")', Number(""));
printResult('Number("text")', Number("text"));
printResult('Boolean("false")', Boolean("false"));
printResult("typeof null", typeof null);
printResult("typeof NaN", typeof NaN);
