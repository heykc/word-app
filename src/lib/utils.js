/**
 * a helper function to act somewhat like a switch statement but returns which ever value is true
 * essentially allows you to assign the result of a switch statement to a variable
 */
export const match = (matcher, cases) => {
  for (const [test, value] of Object.values(cases)) {
    if (matcher === test) {
      return value;
    }
    
    if (typeof test === 'function' && test(matcher)) {
      return value;
    }

    if (test instanceof RegExp && test.test(matcher)) {
      return value;
    }

    if (test === '_') {
      return value;
    }
  }
}