const { web3, ethTx } = require('./web3')
const { MAX_GAS_PER_TX } = require("../keys")

function buildTransaction(txnCount, addressTo, valueInEther, customData) {
    const data = web3.utils.toHex(customData)

    // Create the transaction object
    //console.log("outgoing data:",web3.utils.toHex(customData)) 
    return txObject = {
        chainId: '777',
        nonce: web3.utils.toHex(txnCount),
        gasPrice: web3.utils.toHex(20000000000),
        gasLimit: web3.utils.toHex(100000),
        // gasLimit: web3.utils.toHex(parseInt(MAX_GAS_PER_TX)),
        // from: '0x378c50D9264C63F3F92B806d4ee56E9D86FfB3Ec',
        to: addressTo,
        value: web3.utils.toHex('10'),
        // value: web3.utils.toHex(web3.utils.toWei('1000', 'ether')),
        data
    };
}

function buildSmartContractTransaction(txnCount, contractData) {
    const data = web3.utils.toHex(contractData)

    // Create the transaction object
    return txObject = {
        chainId: '777',
        nonce: web3.utils.toHex(txnCount),
        gasPrice: web3.utils.toHex(20000000000),
        gasLimit: web3.utils.toHex(100000),
        // value: web3.utils.toWei('5000', 'ether'),
        value: web3.utils.toHex('0'),
        to: '0x0000000000000000000000000000000000000000',
        // from: '0x378c50D9264C63F3F92B806d4ee56E9D86FfB3Ec',
        data
    }
}

const sendTransaction = async (txObject, privKey) => {
    // const tx = new ethTx(txObject)
    // tx.sign(privKey)
    
    // Add PrivKey in 2nd Parameter
    let signedTx = await web3.eth.accounts.signTransaction(txObject, '');
    // const signedTx = await web3.eth.accounts.signTransaction(txObject, privKey);
    // console.log('signedTx', signedTx)

    // signedTx {
    //     server2_1  |   messageHash: '0x2a0dd3448a607f333f8b706dc64049ec553f60148dc2d51371a8d2a46bc576ae',
    //     server2_1  |   v: '0x636',
    //     server2_1  |   r: '0x3d50d71464c451ab97df2f46cb6d71770201f95582b6e70313958f62f28bd69a',
    //     server2_1  |   s: '0x20f53c4021c3616c95de583ecb2bb28a0957490663f44b8f388b285b922d7e3f',
    //     server2_1  |   rawTransaction: '0xf88b808504a817c800830186a094378c50d9264c63f3f92b806d4ee56e9d86ffb3ec80a4552410770000000000000000000000000000000000000000000000000000000000000043820636a03d50d71464c451ab97df2f46cb6d71770201f95582b6e70313958f62f28bd69aa020f53c4021c3616c95de583ecb2bb28a0957490663f44b8f388b285b922d7e3f',
    //     server2_1  |   transactionHash: '0x653a7ed03c55675c9e255bfd4e4aa7b58de935f2c592de91050cc8b8019a1ca9'
    //     server2_1  | }

    const rawTx = signedTx.rawTransaction
    if (!web3.utils.isHex(rawTx)) {
        throw new Error('Please provide a valid Hex string.');
    }
    if (!rawTx.startsWith('0x')) {
        rawTx = `0x${rawTx}`;
    }
    // const serializedTx = signedTx.serialize()
    // const serializedTx = tx.serialize()
    // const rawTxHex = '0x' + serializedTx.toString('hex')

    try {
        const receipt = await web3.eth.sendSignedTransaction(rawTx, (error, hash) => {
            broadcastTxHash = hash;
        });
        if (receipt.status) {
            console.log('sendTransaction Receipt Hash', receipt.transactionHash)
            return receipt;
        }
    } catch (e) {
        if (broadcastTxHash) {
            return broadcastTxHash;
        }
        throw new Error(e.message);
    }
    throw new Error('Transaction broadcast failed.');
    // console.log('receipt', receipt)
    // return receipt
}

const getData = async (blockNumber) => {
    const block = await web3.eth.getBlock(blockNumber)
    //console.log(block)
    await getTransaction(block.transactions[0])
}

const getTransaction = async txHash => {
    console.log("Retrieving transaction from Pantheon...")
    const receivedTX = await web3.eth.getTransaction(txHash)
    return receivedTX
}

const deploySmartContract = async (contractData, addressFrom, privKey) => {
    try {
        const txCount = await web3.eth.getTransactionCount(addressFrom)
        // console.log('txCount', txCount)
        const txObject = buildSmartContractTransaction(txCount, contractData)
        // console.log('txObject', txObject)
        const balance = await web3.eth.getBalance('0x378c50D9264C63F3F92B806d4ee56E9D86FfB3Ec')
        console.log('balance: 0x378c50D9264C63F3F92B806d4ee56E9D86FfB3Ec', balance)
        const receipt = await sendTransaction(txObject, privKey)
        //Retriveing contract address and transaction hash
        console.log("deploySmartContract Transaction hash: ", receipt.transactionHash)
        console.log("deploySmartContract Contract address", receipt.contractAddress)
        //await create(`block-${receipt.blockNumber}-received-smart-contract-tx`, JSON.stringify(receipt))
        //console.log(`Contract address saved in path: \
        // ./.data/block-${receipt.blockNumber}-received-smart-contract-tx.txt`)
        // contractAddress null
        return receipt.contractAddress
    } catch (e) {
        console.log(e)
        process.exit()
    }
}

const getValueFromPublicBlockchain = async (EventEmitterAbi, address) => {//address: contract address
    //console.log("retrieving data from pantheon public smart contract...")
    const contractInstance = new web3.eth.Contract(EventEmitterAbi, address, {
        from: '0x1234567890123456789012345678901234567891', // default from address
        gasPrice: '0' // default gas price in wei, 20 gwei in this case
    })
    const value = await contractInstance.methods.getValue().call()
    console.log('value', value)
    return value
}

module.exports = {
    buildTransaction,
    buildSmartContractTransaction,
    sendTransaction, getData,
    getTransaction,
    deploySmartContract,
    getValueFromPublicBlockchain
}