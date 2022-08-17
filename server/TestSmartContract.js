const {buildTransaction} = require('./pantheon_utils/web3Operations')
const {sendTransactionAndProcessIncommingTx} = require("./lib/helpers")
const {test} = require("./Tester")
const valueInEther = "0"
const {web3} = require("./pantheon_utils/web3")
// set to 1 for faster validation in this course.
web3.transactionConfirmationBlocks = 1

let addressTo
const {fileNameStimulus,fileNameResponse} = require('./ParametersSmartContractSending')

const {deploy} = require('./deployPublicSmartContract')
const isContractAddress = process.env.SMART_CONTRACT_ADDRESS
// const {set} = require('./changeSmartContractState')
let txData

const setSimpleStorage = () => {
  console.log("#######################Preparing value for simple storage smart contract stress test#######################")
  const functionName = "setValue"
  const typeOfData = "uint256"
  const valueToSet = 67
  let set = web3.eth.abi.encodeFunctionSignature(`${functionName}(${typeOfData})`)//function name to use
  let value = web3.eth.abi.encodeParameter('uint256', valueToSet)//setting the value

  const txData = set + value.substr(2)
  return txData
}

const getSmartContractParameters = async() => {
  if (isContractAddress) {
    addressTo = process.env.SMART_CONTRACT_ADDRESS
    console.log("Using existing contract address", addressTo)
  }else{
    console.log('hi getSmartContractParameters by deploy()')
    addressTo = await deploy()
  }

  txData = setSimpleStorage()  
}

const publishSmartContractTransaction = async(privKey,t1,numberOfTransactions) => {
  const txCount = await web3.eth.getTransactionCount('0x378c50D9264C63F3F92B806d4ee56E9D86FfB3Ec')
  const addressTo = '0x378c50D9264C63F3F92B806d4ee56E9D86FfB3Ec'
  console.log('publishSmartContractTransaction')
  console.log('addressTo', addressTo)
  const txObject = buildTransaction(txCount,addressTo,valueInEther,txData)
  sendTransactionAndProcessIncommingTx(txObject,privKey,t1,fileNameResponse,numberOfTransactions)  
}

const execSmartContractTest = async() => {
  await getSmartContractParameters()
  test(fileNameStimulus,publishSmartContractTransaction)
}

module.exports = {execSmartContractTest}