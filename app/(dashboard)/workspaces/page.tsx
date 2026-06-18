import React from 'react'

function WorkspacePage() {
  return (
    <div className='p-6 max-w-lg mx-auto'>
      <h2 className='text-2xl font-semibold mb-4'>create new workspace</h2>
      {/* basic form to take data */}
      <form className='flex flex-col gap-4'>
        <div className='flex flex-col gap-2'>
          <label htmlFor='name' className='font-medium text-sm'>
            name
          </label>
          <input 
            id='name'
            type='text' 
            placeholder='enter name' 
            className='border rounded-md px-3 py-2 outline-none focus:ring-2'
          />
        </div>
        
        <div className='flex flex-col gap-2'>
          <label htmlFor='description' className='font-medium text-sm'>
            description
          </label>
          <textarea 
            id='description'
            rows={4}
            className='border rounded-md px-3 py-2 outline-none focus:ring-2' 
            placeholder='enter description'
          ></textarea>
        </div>

        <button 
          type='submit' 
          className='bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors self-start mt-2'
        >
          submit
        </button>
      </form>
    </div>
  )
}

export default WorkspacePage;