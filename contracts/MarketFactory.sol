// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./PredictionMarket.sol";

contract MarketFactory {

    // ─── State ────────────────────────────────────────────────
   // Array of all deployed market addresses
    address[] public allMarkets;

    // Who deployed the factory (platform admin)
    address public admin;

    // Track which markets a creator made
    mapping(address => address[]) public marketsByCreator;

    // ─── Events ───────────────────────────────────────────────

    event MarketCreated(
        address indexed marketAddress,
        string question,
        uint256 endTime,
        address indexed creator
    );

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can create markets");
        _;
    }

    // ─── Market Creation ───────────────────────────────────────

function createMarket(
        string memory _question,
        uint256 _endTime
    ) external onlyAdmin returns (address) {
        // Deploy a brand new PredictionMarket contract
        PredictionMarket market = new PredictionMarket(
            _question,
            _endTime,
            msg.sender   // the creator becomes the market's owner/resolver
        );

        address marketAddress = address(market);

        allMarkets.push(marketAddress);
        marketsByCreator[msg.sender].push(marketAddress);

        emit MarketCreated(marketAddress, _question, _endTime, msg.sender);

        return marketAddress;
    }

    // Get total number of markets
    function getMarketCount() external view returns (uint256) {
        return allMarkets.length;
    }

    // Get all market addresses at once (for the frontend)
    function getAllMarkets() external view returns (address[] memory) {
        return allMarkets;
    }

    // Get markets made by a specific creator
    function getMarketsByCreator(address creator) external view returns (address[] memory) {
        return marketsByCreator[creator];
    }

}