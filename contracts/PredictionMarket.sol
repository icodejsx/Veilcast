// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PredictionMarket is ReentrancyGuard, Ownable {

    // ------- Market State -------   

    string public question; //"Will the price of BTC exceed $100,000 by 2027-01-01?";
    uint256 public endTime; // when betting close (until text stamp)
    bool public resolved; //  has the market has been resolved ?
    bool public outcome; //  true  =  yes won, false = no won 


     // ─── Bet Tracking ───────────────────────────────────────
    uint256 public totalYes;       // total AVAX bet on YES
    uint256 public totalNo;        // total AVAX bet on NO
    mapping(address => uint256) public yesBets; // how much each user has bet on YES
    mapping(address => uint256) public noBets; // How much each user has bet on NO
    mapping(address => bool) public hasClaimed; // Has user claimed their winnings yet?

    // ─── Fee ────────────────────────────────────────────────
    uint256 public constant FEE_PERCENT = 2;      // 2% platform fee

    // ─── Events ───────────────────────────────────────────────
    event BetPlaced(address indexed user, bool isYes, uint256 amount);
    event MarketResolved(bool outcome);
    event WinningsClaimed(address indexed user, uint256 amount);


    // ─── Constructor ─────────────────────────────────────────
    constructor(
        string memory _question,
        uint256 _endTime,
        address _owner
    ) Ownable(_owner) {
        require(_endTime > block.timestamp, "End time must be in the future");
        question = _question;
        endTime = _endTime;
    }


    // ─── Betting ─────────────────────────────────────────────
    modifier marketOpen() {
        require(block.timestamp < endTime, "Market is closed");
        require(!resolved, "Market already resolved");
        _;
    }

    function betYes() external payable marketOpen nonReentrant {
        require(msg.value > 0, "Must send AVAX");
        yesBets[msg.sender] += msg.value;
        totalYes += msg.value;
        emit BetPlaced(msg.sender, true, msg.value);
    }

    function betNo() external payable marketOpen nonReentrant {
        require(msg.value > 0, "Must send AVAX");
        noBets[msg.sender] += msg.value;
        totalNo += msg.value;
        emit BetPlaced(msg.sender, false, msg.value);
    }

    // ─── Resolution ──────────────────────────────────────────
    function resolve(bool _outcome) external onlyOwner {
        require(block.timestamp >= endTime, "Market not ended yet");
        require(!resolved, "Already resolved");
        resolved = true;
        outcome = _outcome;
        emit MarketResolved(_outcome);
    }

    // ─── Claim Winnings ──────────────────────────────────────
    function claim() external nonReentrant {
        require(resolved, "Market not resolved yet");
        require(!hasClaimed[msg.sender], "Already claimed");

        uint256 userBet;
        uint256 winningSide;
        uint256 losingSide;

        if (outcome == true) {
            userBet = yesBets[msg.sender];
            winningSide = totalYes;
            losingSide = totalNo;
        } else {
            userBet = noBets[msg.sender];
            winningSide = totalNo;
            losingSide = totalYes;
        }

        require(userBet > 0, "No winning bet");

        // Calculate winnings: your stake + your share of losing pool
        uint256 grossWinnings = userBet + (userBet * losingSide / winningSide);
        uint256 fee = (grossWinnings * FEE_PERCENT) / 100;
        uint256 payout = grossWinnings - fee;

        hasClaimed[msg.sender] = true;
        
        (bool success, ) = payable(msg.sender).call{value: payout}("");
        require(success, "Transfer failed");

        emit WinningsClaimed(msg.sender, payout);
    }


    // ─── Views ───────────────────────────────────────────────
    function getMarketInfo() external view returns (
        string memory _question,
        uint256 _endTime,
        bool _resolved,
        bool _outcome,
        uint256 _totalYes,
        uint256 _totalNo
    ) {
        return (question, endTime, resolved, outcome, totalYes, totalNo);
    }

    function getUserBets(address user) external view returns (
        uint256 _yesBet,
        uint256 _noBet,
        bool _claimed
    ) {
        return (yesBets[user], noBets[user], hasClaimed[user]);
    }

    // Owner can withdraw collected fees
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "Nothing to withdraw");
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Transfer failed");
    }

    
}