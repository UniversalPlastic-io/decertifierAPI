// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Notarizer is Ownable {
    struct MerkleData {
        string merkleRoot;
        string bussinessId;
    }

    mapping(uint256 => MerkleData) public merkleRoots;

    constructor(address initialOwner)  Ownable(initialOwner)
    {
        
    }

    function updateMerkleRoot(uint256 id, string calldata newMerkleRoot, string calldata bussinessId ) external onlyOwner {
        require(bytes(merkleRoots[id].merkleRoot).length == 0, 'There is already a value stored for that id');
        merkleRoots[id] = MerkleData(newMerkleRoot, bussinessId) ;
    }

    function getMerkleRoot(uint256 id) external view returns (string memory) {
        return merkleRoots[id].merkleRoot;
    }
    function getMerkleRootBussinessId(uint256 id) external view returns (string memory) {
        return merkleRoots[id].bussinessId;
    }

    function getMerkleData(uint256 id) external view returns (MerkleData memory){
        return merkleRoots[id];
    }
}