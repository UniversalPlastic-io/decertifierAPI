import * as crypto from "crypto-js"

class MerkleTree {
  public leaves: string[]
  public treeLevels: string[][] | undefined
  public root: string | undefined
  constructor(data: string[]) {
    this.treeLevels = []
    this.leaves = data.map((leaf) => crypto.SHA256(leaf).toString())
    this.root = this.buildTree()[0]
  }

  buildTree(): string[] {
    const tree: string[] = [...this.leaves]

    this.treeLevels?.push(this.leaves)

    while (tree.length > 1) {
      const level: string[] = []

      for (let i = 0; i < tree.length; i += 2) {
        const left = tree[i]
        if (i + 1 > tree.length - 1) {
          level.push(left)
        } else {
          const right = i + 1 < tree.length ? tree[i + 1] : ""
          const combinedHash = crypto.SHA256(left + right).toString()
          level.push(combinedHash)
        }
      }

      tree.length = 0
      tree.push(...level)
      this.treeLevels?.push(level)
    }

    return tree
  }

  getTree(): string[][] {
    return this.treeLevels!
  }

  getRoot(): string {
    return this.root!
  }

  getProof(index: number): string[][] {
    if (index < 0 || index >= this.leaves.length) {
      throw new Error("Invalid index")
    }

    const proof: string[][] = []
    let level: string[] = [...this.leaves]

    while (level.length > 1) {
      if (index % 2 === 1) {
        proof.push([level[index - 1], "left"])
      } else if (index < level.length - 1) {
        proof.push([level[index + 1], "right"])
      }

      level = level.reduce((acc: any, node, i) => {
        if (i % 2 === 0) {
          const left = node
          if (i + 1 < level.length) {
            const right = level[i + 1]
            const combinedHash = crypto.SHA256(left + right).toString()
            acc.push(combinedHash)
          } else {
            acc.push(left)
          }
        }
        return acc
      }, [])

      index = Math.floor(index / 2)
    }

    return proof
  }
}

const validateLeaf = (leaf: string, proof: string[][], root: string) => {
  const proofCopy = new Array(...proof)
  let currentHash = crypto.SHA256(leaf).toString()
  while (proofCopy.length > 0) {
    if (proofCopy[0][1] === "right") {
      currentHash = crypto.SHA256(currentHash + proofCopy[0][0]).toString()
    } else {
      currentHash = crypto.SHA256(proofCopy[0][0] + currentHash).toString()
    }
    proofCopy.shift()
  }
  return currentHash === root
}

export { MerkleTree, validateLeaf }
