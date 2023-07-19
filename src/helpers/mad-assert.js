import { AssertionError } from 'assert';

export const assert = (condition, msg) => {
  if (condition) return;
  if (typeof msg === 'string')
    throw new AssertionError({
      message: msg,
    });
  throw msg;
};

export const assertEvery = (conditionArray, msg) => {
  conditionArray.forEach((condition) => assert(condition, msg));
};
