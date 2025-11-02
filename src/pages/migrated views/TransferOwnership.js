<h1>Transfer Owner</h1>

         <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <form onSubmit={(event) => {
                  event.preventDefault()

                  this.transferOwner(this.receiver.value, this.tokenId.value)
                }}>
                  <input
                    type='text'
                    className='form-control mb-1'
                    placeholder='Receiver Address'
                    ref={(input) => { this.receiver = input }}
                  />
                  <input
                    type='text'
                    className='form-control mb-1'
                    placeholder='Token Id'
                    ref={(input) => { this.tokenId = input }}
                  />
                                    <input
                    type='submit'
                    className='btn btn-block btn-primary'
                    value='Transfer to new Owner'
                  />
                </form>
              </div>
            </main>