<main role="main" className="col-lg-12 d-flex text-center">
<div className="content mr-auto ml-auto">
  <h1>Confirm Pregnancy</h1>
  <form onSubmit={(event) => {
    event.preventDefault()

    this.confirmPregnancy(this.mother.value, this.father.value)
  }}>
    <input
      type='text'
      className='form-control mb-1'
      placeholder='Mother TokenId'
      ref={(input) => { this.mother = input }}
    />
    <input
      type='text'
      className='form-control mb-1'
      placeholder='Father TokenId'
      ref={(input) => { this.father = input }}
    />
    <input
      type='submit'
      className='btn btn-block btn-primary'
      value='Confirm Pregnancy'
    />
  </form>
</div>
</main>