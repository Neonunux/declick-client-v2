import TRuntime from '@/run/TRuntime'

/**
 * SynchronousManager runs the synchronicity between objects in TRuntime.
 * @exports SynchronousManager  
 */
class SynchronousManager {
 constructor() {
     this.running = false
 }

 /**
  * Suspend the execution of the interpreter and set running to true.
  */
 begin() {
     TRuntime.suspend()
     this.running = true
 }

 /**
  * Resume the execution of the interpreter and set running to false.
  */
 end() {
     TRuntime.resume()
     this.running = false
 }

 /**
  * Check the value of running.
  * @returns {Boolean}
  */
 isRunning() {
     return this.running
 }
}

export default SynchronousManager
