const {web3} = require('./pantheon_utils/web3')
const {buildTransaction} = require('./pantheon_utils/web3Operations')
const {sendTransactionAndProcessIncommingTx} = require("./lib/helpers")
const {test} = require("./Tester")
const {ADDRESS_TO} = require('./keys')
const valueInEther = "0"
const addressTo = ADDRESS_TO
const {fileNameStimulus,fileNameResponse,randomData} = require('./ParametersEtherSending')
 
const publishEtherTransaction = async (privKey,t1,numberOfTransactions) => {
  try {
    const txCount = await web3.eth.getTransactionCount('0x378c50D9264C63F3F92B806d4ee56E9D86FfB3Ec')
    // const txCount = 0 //await web3.eth.getTransactionCount(addressFrom)
    console.log('publishEtherTransaction txCount', txCount)
    const txObject = buildTransaction(txCount,addressTo,valueInEther,randomData)
    await sendTransactionAndProcessIncommingTx(txObject,privKey,t1,fileNameResponse,numberOfTransactions)  
  } catch (e) {
    console.log('error hi', e)
  }

}

const execEtherTest = () => {  
  test(fileNameStimulus,publishEtherTransaction)
}

module.exports = {execEtherTest}