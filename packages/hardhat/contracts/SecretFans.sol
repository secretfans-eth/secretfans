//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";


contract SecretFans is ERC1155("") {
	uint256 public constant _TIMELOCK = 1 days; // ? 1 day ?
	uint256 public constant defaultMinSubFee = 0.01 ether;
	uint256 public constant maxSubs = 128;
	uint256 public currentTokenId = 0;

	struct subscription {
		uint256 shares;
		bytes publicKey;
	}

	struct ContentCreatorChannel {
		uint256 nSubs;
		uint256 minSubFee;
		uint256 totalETH;
		uint256 totalShares;
		address[128] subs;
	}

	struct NftRegister {
		string uri;
		address contentCreator;
	}

	struct decryptionKey {
		address sub;
		bytes key;
	}

	mapping(uint256 => NftRegister) NftRegistry;
	mapping(address => ContentCreatorChannel) public Channels;
	mapping(address => mapping(address => subscription)) public subscribers; // subAdd to CCAdd with sub info(shares,pubKey)
	mapping(address => uint256[]) nftHolded;

	mapping(address => uint256) public timelock;

	//--------------------------------------------Events------------------------------------------------------
	event NewSubscription(
		address indexed contentCreator,
		address subscriber,
		bytes publicKey,
		uint256 subsShares
	);

	event newNFTPublished(address indexed contentCreator, uint256 tokenId);

	event EncriptedNFT(uint256 indexed tokenId, address sub, bytes key);

	modifier notLocked() {
		require(
			timelock[msg.sender] == 0 ||
				timelock[msg.sender] <= block.timestamp,
			"Function is timelocked"
		);
		_;
	}

	function subscribeSpotsAvaliable(
		address contentCreator,
		bytes memory publicKey
	) public payable {
		require(
			subscribers[msg.sender][contentCreator].shares == 0,
			"You are already subscribed to this channel"
		);
		ContentCreatorChannel storage channel = Channels[contentCreator];
		channel.minSubFee = defaultMinSubFee;
		require(channel.nSubs < maxSubs, ""); //TODO
		require(
			msg.value > channel.minSubFee,
			"Insufficient balance to pay subscription fee"
		);
		uint256 sharesPerETH = 1;
		if (channel.totalETH != 0) {
			sharesPerETH = channel.totalShares / channel.totalETH;
		}
		channel.totalETH += msg.value;
		uint256 newSubsShares = msg.value * sharesPerETH;
		channel.totalShares += newSubsShares;
		channel.subs[channel.nSubs] = msg.sender;

		subscribers[msg.sender][contentCreator] = subscription(
			newSubsShares,
			publicKey
		);

		emit NewSubscription(
			contentCreator,
			msg.sender,
			publicKey,
			newSubsShares
		); // ? emit nSubs ?
		channel.nSubs++;
		// TODO create ERC20
	}

	function subscribeSpotsFull(
		address contentCreator,
		address subscriberOut,
		bytes memory subscriberInPublicKey
	) public payable {
		ContentCreatorChannel storage channel = Channels[contentCreator];
		require(
			subscribers[subscriberOut][contentCreator].shares != 0,
			"This subscriber doesn't exist."
		);

		uint256 sharesPerETH = channel.totalShares / channel.totalETH;
		require(
			msg.value * sharesPerETH >=
				(subscribers[subscriberOut][contentCreator].shares * 3) / 2,
			"Value not enough to pay for subscription"
		); //! Tokenomics. The msg.value needs to be 1.5 times the value of shars of the subOut

		(bool success, ) = subscriberOut.call{ value: (msg.value * 5) / 4 }(""); // ! Tokenomics. 1.25 of the value is sent to the subOut
		require(success, "Failed to send Ether.");

		channel.totalETH += (msg.value * 1) / 4; //! Tokenomics. The other 0.25 of the msg.value is added to the totalETH
		uint256 incrementTotalShares = (msg.value * sharesPerETH * 1) / 4; //! Tokenomics. The other 0.25 of the msg.value is added to the totalShares
		channel.totalShares += incrementTotalShares;
		uint256 newShares = (msg.value * sharesPerETH * 5) / 4;

		// Update subscribers shares balances for this CC
		subscribers[subscriberOut][contentCreator].shares = 0;
		subscribers[msg.sender][contentCreator].shares = newShares;
		emit NewSubscription(
			contentCreator,
			msg.sender,
			subscriberInPublicKey,
			newShares
		);
	}

	function unsubscribe(address contentCreator) public {
		ContentCreatorChannel storage channel = Channels[contentCreator];
		uint256 subShares = subscribers[msg.sender][contentCreator].shares;
		require(subShares != 0, "You're not subscribed.");

		uint256 sharesPerETH = channel.totalShares / channel.totalETH;
		uint256 subETHvalue = subShares / sharesPerETH;

		(bool success, ) = msg.sender.call{ value: subETHvalue }("");
		require(success, "Failed to send Ether.");

		channel.totalETH -= subETHvalue;
		channel.totalShares -= subShares;
		subscribers[msg.sender][contentCreator].shares = 0;
		channel.nSubs--;
	}

	function topUpShares(address contentCreator) public payable {
		ContentCreatorChannel storage channel = Channels[contentCreator];
		uint256 subShares = subscribers[msg.sender][contentCreator].shares;
		require(subShares != 0, "You're not subscribed.");

		uint256 sharesPerETH = channel.totalShares / channel.totalETH;
		uint256 subSharesValue = msg.value * sharesPerETH;

		channel.totalETH += msg.value;
		channel.totalShares += subSharesValue;
		subscribers[msg.sender][contentCreator].shares += subSharesValue;
	}

	function withdrawShares(
		address contentCreator,
		uint256 ethToWithdraw
	) public {
		ContentCreatorChannel storage channel = Channels[contentCreator];
		uint256 subShares = subscribers[msg.sender][contentCreator].shares;
		uint256 sharesPerETH = channel.totalShares / channel.totalETH;
		require(
			subShares / sharesPerETH > ethToWithdraw,
			"You're not subscribed."
		);

		(bool success, ) = msg.sender.call{ value: ethToWithdraw }("");
		require(success, "Failed to send Ether.");

		channel.totalETH -= ethToWithdraw;
		channel.totalShares -= ethToWithdraw * sharesPerETH;
		subscribers[msg.sender][contentCreator].shares -=
			ethToWithdraw *
			sharesPerETH;
	}

	function publish(
		string memory _uri,
		decryptionKey[] calldata encryptedContentEncriptionKeys //TODO fer el evento
	) public notLocked {
		ContentCreatorChannel memory channel = Channels[msg.sender];
		uint256 _currentTokenId = currentTokenId;
		NftRegistry[_currentTokenId] = NftRegister(_uri, msg.sender);

		(bool success, ) = msg.sender.call{
			value: (channel.totalETH * 3) / 20
		}("");
		require(success, "Failed to send Ether.");
		channel.totalETH -= (channel.totalETH * 3) / 20;
		currentTokenId++;
		timelock[msg.sender] = block.timestamp + _TIMELOCK;
		emit newNFTPublished(msg.sender, _currentTokenId);
		for (uint256 i = 0; i < encryptedContentEncriptionKeys.length; i++) {
			emit EncriptedNFT(
				_currentTokenId,
				encryptedContentEncriptionKeys[i].sub,
				encryptedContentEncriptionKeys[i].key
			);
		}
	}

	function uri(uint256 tokenId) public view override returns (string memory) {
		return (NftRegistry[tokenId].uri);
	}

	function mint(uint256 tokenId) public {
		require(
			balanceOf(msg.sender, tokenId) == 0,
			"You already minted this NFT!"
		);
		require(
			subscribers[msg.sender][NftRegistry[tokenId].contentCreator]
				.shares != 0,
			"You are not subscribed!"
		);
		_mint(msg.sender, tokenId, 1, "");
		nftHolded[msg.sender].push(tokenId);
	}

	/**
	 * Function that allows the contract to receive ETH
	 */
	receive() external payable {}

	function getSubShares(
		address subscriber,
		address contentCreator
	) public view returns (uint256) {
		return subscribers[subscriber][contentCreator].shares;
	}

	function getSubPubKeys(
		address contentCreator
	) public view returns (bytes[] memory) {
		ContentCreatorChannel storage channel = Channels[contentCreator];
		bytes[] memory pubKeys = new bytes[](channel.nSubs);

		for (uint256 i = 0; i < channel.nSubs; i++) {
			address subAddress = channel.subs[i];
			pubKeys[i] = subscribers[subAddress][contentCreator].publicKey;
		}

		return pubKeys;
	}

	function holdedNFTs(
		address nftHolder
	) public view returns (string[] memory) {
		string[] memory uris = new string[](nftHolded[nftHolder].length);

		for (uint256 i = 0; i < nftHolded[nftHolder].length; i++) {
			uint256 tokenId = nftHolded[nftHolder][i];
			uris[i] = uri(tokenId);
		}

		return uris;
	}

	function getCCSubscriptors(
		address contentCreator
	) public view returns (address[] memory) {
		address[128] storage fixedArray = Channels[contentCreator].subs;
		address[] memory dynamicArray = new address[](fixedArray.length);

		for (uint256 i = 0; i < fixedArray.length; i++) {
			dynamicArray[i] = fixedArray[i];
		}

		return dynamicArray;
	}
}
