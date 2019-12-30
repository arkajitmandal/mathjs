//  import { clone } from '../../utils/object'
import { factory } from '../../utils/factory'
import { format } from '../../utils/string'

const name = 'eigs'
const dependencies = ['typed', 'matrix']

export const createEigs = /* #__PURE__ */ factory(name, dependencies, ({ typed, matrix }) => {
  /**
   * Compute eigenvalue and eigenvector of a real symmetric matrix.
   * Only applicable to two dimensional symmetric matrices. Uses Jacobi
   * Algorithm.
   *
   * Syntax:
   *
   *     math.eigs(x)
   *
   * Examples:
   *
   *     const A = [[1, 1], [1, 1]]
   *     math.eigs(A)               // returns {eigval: [0, 2],eigvec:[[0.5, -0.5],[0.5, 0.5]]}
   *
   * See also:
   *
   *     inv
   *
   * @param {Array | Matrix} x  Matrix to be diagonalized
   * @return {Array} [eigenvalues,eigenvectors] Array containing eigenvalues (Array) and eigenvectors (2D Array).
   */
  const eigs = typed('eigs', {

    Array: function (x) {
      // check array size
      const mat = matrix(x)
      const size = mat.size()
      if (size.length !== 2 || size[0] !== size[1]) {
        throw new RangeError('Matrix must be square ' +
          '(size: ' + format(size) + ')')
      }

      // use dense 2D matrix implementation
      return diag(x)
    },

    Matrix: function (x) {
      // use dense 2D array implementation
      // dense matrix
      const size = x.size()
      if (size.length !== 2 || size[0] !== size[1]) {
        throw new RangeError('Matrix must be square ' +
          '(size: ' + format(size) + ')')
      }

      return diag(x.toArray())
    }
  })

  // diagonalization implementation
  function diag (x, precision = 1E-12) {
    const N = x.length
    const e0 = Math.abs(precision / N)
    let psi
    let Sij = new Array(N)
    // Sij is Identity Matrix
    for (let i = 0; i < N; i++) {
      Sij[i] = Array(N).fill(0)
      Sij[i][i] = 1.0
    }
    // initial error
    let Vab = getAij(x)
    while (Math.abs(Vab[1]) >= Math.abs(e0)) {
      const i = Vab[0][0]
      const j = Vab[0][1]
      psi = getTheta(x[i][i], x[j][j], x[i][j])
      x = x1(x, psi, i, j)
      Sij = Sij1(Sij, psi, i, j)
      Vab = getAij(x)
    }
    var Ei = Array(N).fill(0) // eigenvalues
    for (let i = 0; i < N; i++) {
      Ei[i] = x[i][i]
    }
    return [Ei, Sij]
  }

  // Rotation Matrix
  function Rot (theta) {
    const s = Math.sin(theta)
    const c = Math.cos(theta)
    const Mat = [[c, s], [-s, c]]
    return Mat
  }

  // get angle
  function getTheta (aii, ajj, aij) {
    let th = 0.0
    const denom = (ajj - aii)
    if (Math.abs(denom) <= 1E-14) {
      th = Math.PI / 4.0
    } else {
      th = 0.5 * Math.atan(2.0 * aij / (ajj - aii))
    }
    return th
  }

  // update eigvec
  function Sij1 (Sij, theta, i, j) {
    const N = Sij.length
    const c = Rot(theta)[0][0]
    const s = Rot(theta)[0][1]
    var Ski = new Array(N).fill(0)
    var Skj = new Array(N).fill(0)
    for (let k = 0; k < N; k++) {
      Ski[k] = c * Sij[k][i] - s * Sij[k][j]
      Skj[k] = s * Sij[k][i] + c * Sij[k][j]
    }
    for (let k = 0; k < N; k++) {
      Sij[k][i] = Ski[k]
      Sij[k][j] = Skj[k]
    }
    return Sij
  }

  // update matrix
  function x1 (Hij, theta, i, j) {
    const N = Hij.length
    const c = Math.cos(theta)
    const s = Math.sin(theta)
    const c2 = c * c
    const s2 = s * s
    //  var Ans = new Array(N).fill(Array(N).fill(0));
    var Aki = new Array(N).fill(0)
    var Akj = new Array(N).fill(0)
    //  Aii
    const Aii = c2 * Hij[i][i] - 2 * c * s * Hij[i][j] + s2 * Hij[j][j]
    const Ajj = s2 * Hij[i][i] + 2 * c * s * Hij[i][j] + c2 * Hij[j][j]
    // 0  to i
    for (let k = 0; k < N; k++) {
      Aki[k] = c * Hij[i][k] - s * Hij[j][k]
      Akj[k] = s * Hij[i][k] + c * Hij[j][k]
    }
    // Modify Hij
    Hij[i][i] = Aii
    Hij[j][j] = Ajj
    Hij[i][j] = 0
    Hij[j][i] = 0
    // 0  to i
    for (let k = 0; k < N; k++) {
      if (k !== i && k !== j) {
        Hij[i][k] = Aki[k]
        Hij[k][i] = Aki[k]
        Hij[j][k] = Akj[k]
        Hij[k][j] = Akj[k]
      }
    }
    return Hij
  }

  // get max off-diagonal value from Upper Diagonal
  function getAij (Mij) {
    var N = Mij.length
    var maxMij = 0.0
    var maxIJ = [0, 1]
    for (var i = 0; i < N; i++) {
      for (var j = i + 1; j < N; j++) {
        if (Math.abs(maxMij) < Math.abs(Mij[i][j])) {
          maxMij = Math.abs(Mij[i][j])
          maxIJ = [i, j]
        }
      }
    }
    return [maxIJ, maxMij]
  }

  return eigs
})
