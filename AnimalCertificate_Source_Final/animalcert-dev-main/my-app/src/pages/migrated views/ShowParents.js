<main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <h1>Show Parents-- NOT IMPLEMENTED</h1>
                <form onSubmit={(event) => {
                  event.preventDefault()

                  this.loadAnimal(this.id.value)
                }}>
                  <input
                    type='text'
                    className='form-control mb-1'
                    placeholder='TokenId'
                    ref={(input) => { this.id = input }}
                  />
                  <input
                    type='submit'
                    className='btn btn-block btn-primary'
                    value='Show Parents'
                  />
                </form>
              </div>
            </main>