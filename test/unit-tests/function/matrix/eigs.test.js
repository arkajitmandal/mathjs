import assert from 'assert'
import math from '../../../../src/bundleAny'
import approx from '../../../../tools/approx'
const eigs = math.eigs

describe('eigs', function () {
  it('should only accept a square matrix', function () {
    assert.throws(function () { eigs(math.matrix([[1, 2, 3], [4, 5, 6]])) }, /Matrix must be square/)
    assert.throws(function () { eigs([[1, 2, 3], [4, 5, 6]]) }, /Matrix must be square/)
    assert.throws(function () { eigs([[1, 2], [4, 5, 6]]) }, /DimensionError: Dimension mismatch/)
    assert.throws(function () { eigs([4, 5, 6]) }, /Matrix must be square/)
    assert.throws(function () { eigs(1.0) }, /TypeError: Unexpected type of argument/)
    assert.throws(function () { eigs('random') }, /TypeError: Unexpected type of argument/)
  })
  it('eigenvalue check', function () {
    // trivial test
    approx.deepEqual(eigs(
      [[1, 0], [0, 1]])[0], [1, 1]
    )
  })
})
