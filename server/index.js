const {buildTransaction,sendTransaction} = require('./pantheon_utils/web3Operations')
const {createRandomString,generateKeys,verifyDesiredRate,verifyTestime,verifyAmountData,verifyNumberOfContainers} = require("./lib/helpers")
const {append} = require("./lib/logs")
const {DESIRED_RATE_TX,AMOUNT_DATA_BYTES,TEST_TIME_MINUTES,NUMBER_OF_CONTAINERS,STORE_DATA} = require("./keys")

///////////////////////////////////VERIFICATIONS/////////////////////////////////////////////
const desiredRateTx = verifyDesiredRate(parseInt(DESIRED_RATE_TX))
const amountData =verifyAmountData(AMOUNT_DATA_BYTES) //data to store in bytes on each transaction
const testTimeMinutes = verifyTestime(TEST_TIME_MINUTES)
const testTime = testTimeMinutes * 60//time in minutes => convert to seconds
const numerOfContainers = verifyNumberOfContainers(NUMBER_OF_CONTAINERS)

///////////////////////////////////PROCESS VARIABLES/////////////////////////////////////////////
const addressTo = '0xf17f52151EbEF6C7334FAD080c5704D77216b732'
const valueInEther = "0"
let randomData=""
let t1=null
let count = 0
let failed = 0
let i = 0

const timeOut = 1/desiredRateTx * 1000
const numberOfTransactions = desiredRateTx * testTime
const randomPrivateKeys = generateKeys(numberOfTransactions)
//log Files
let fileNameStimulus=`${desiredRateTx*numerOfContainers}-txsPerSec-0-bytesperTx-${testTimeMinutes}-minutes-stimulus`
let fileNameResponse=`${desiredRateTx*numerOfContainers}-txsPerSec-0-bytesperTx-${testTimeMinutes}-minutes-response`

if(amountData>0){
  randomData = createRandomString(parseInt(amountData))
  fileNameStimulus=`${desiredRateTx*numerOfContainers}-txsPerSec-${amountData}-bytesperTx-${testTimeMinutes}-minutes-stimulus`
  fileNameResponse=`${desiredRateTx*numerOfContainers}-txsPerSec-${amountData}-bytesperTx-${testTimeMinutes}-minutes-response`
}

////////////////////////////CORE FUNCTIONS///////////////////////////////////////////////////
const publishData = async(privKey,i,addtionalData="") => {
  let txTimeResponse
  try{
    const txCount = 0//await web3.eth.getTransactionCount(addressFrom)
    const txObject = buildTransaction(txCount,addressTo,valueInEther,addtionalData)
    await sendTransaction(txObject,privKey)//const receipt = await sendTransaction(txObject,privKey)//only awaiting here for pantheon response
    txTimeResponse = (Date.now() - t1)
    if(STORE_DATA=="TRUE"){
      //append(`${fileNameResponse}`,`${txTimeResponse.toString()},${(numberOfTransactions-count).toString()}`) //sending without awaitng
      append(`${fileNameResponse}`,`${txTimeResponse.toString()},${(count+1).toString()}`) //sending without awaitng
    }
    count++
    //console.log(`Transaction N° ${i} Stored on block `,receipt.blockNumber,"...")  on block `,receipt.blockNumber,"...")        
  }catch(e){
    console.log(`Error with transaction N° ${i} => ${e.message}\n Error occurred in privateKey: ${privKey}`)
    failed++
  }

  if((count+failed)===numberOfTransactions){
    if(!txTimeResponse){
	txTimeResponse = Date.now()-t1    
    }
    showResponseResults(failed,txTimeResponse/1000)
    console.log("All done!!")
  }
}

//@TODO: improve file name and randomData
const logOutputAndPublish = (pK,i) => {
  const txSendingTime = Date.now() - t1
  if(STORE_DATA=="TRUE"){
    append(`${fileNameStimulus}`,`${txSendingTime.toString()},${(i+1).toString()}`)
  }
  publishData(pK,i,randomData)
}

const sendTxs =  numberOfTransactions => {  

  if(i<numberOfTransactions){
    //publishing
    logOutputAndPublish(randomPrivateKeys[i],i)
    
    //waiting
    while((Date.now() - tPrevious) < timeOut){
    //waiting => more precise   
    }

    tPrevious=Date.now()

     //Finishing
    if(i==numberOfTransactions-1){
      showStimulusResults()
    }

    //recursive
    i++
    setTimeout(()=>{
    sendTxs(numberOfTransactions)//using recursive strategy to achieve delay
    },0)
    //sendTxs(numberOfTransactions)//using recursive strategy to achieve delay
  }
}

///////////////////////////////////STIMULUS AND RESULTS////////////////////////////////////////////////

const showStimulusResults = () => {
  console.log("\n************STIMULUS STATISTICS***************")
  const t2 = Date.now()
  console.log("N° sent Tx: ",numberOfTransactions)
  const delta = (t2-t1)/1000
  console.log("time (s):", delta)
  const rate = numberOfTransactions/(delta)
  console.log("Rate: ",rate, "tx/s")
  console.log("Data on each Tx (KB): ",amountData/1000)
}

const showResponseResults = (failed,delta) => {
  console.log("\n************RESPONSE STATISTICS***************")  
  console.log("N° processed Tx by Pantheon: ",numberOfTransactions-failed)
  console.log(`N° no processed txs: ${failed}`)
  console.log(`response time (s):  ${delta}` )
  console.log(`Effectiveness(%): ${(numberOfTransactions-failed)/numberOfTransactions*100}%`)  
  const rate = numberOfTransactions/(delta)
  console.log("Average responsiveness rate: ",rate, "tx/s")
}

////////////////////////////////////MAIN/////////////////////////////////////////////

t1 = Date.now()
let tPrevious = t1
console.log(`Please wait; this test will aproximately take ${timeOut/1000*2*numberOfTransactions} seconds...`)
sendTxs(numberOfTransactions)

//node index.js rate(tx/s) amountDataBytes timeTest(minutes)
