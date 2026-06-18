import { Input } from '@/components/ui/input';
import React from 'react'
import { Button } from '@/components/ui/button';

function WorkspacePage() {
  return (
    <div className='w-full px-4 py-6 sm:p-6 max-w-lg mx-auto'>
      <h2 className='text-xl sm:text-2xl font-semibold mb-4'>create new workspace</h2>
      {/* basic form to take data */}


      <form action="/api/workspaces" method="post" className='flex flex-col gap-4'>
        <input type="hidden" name="_action" value="create" />
        <div className='flex flex-col gap-2'>
          <label htmlFor='name' className='font-medium text-sm'>
            name
          </label>
          <input
            id='name'
            name='name'
            type='text'
            placeholder='enter name'
            className='border rounded-md px-3 py-2 outline-none focus:ring-2 w-full text-sm sm:text-base'
            required
          />
        </div>

        <div className='flex flex-col gap-2'>
          <label htmlFor='description' className='font-medium text-sm'>
            description
          </label>
          <textarea
            id='description'
            name='description'
            rows={4}
            className='border rounded-md px-3 py-2 outline-none focus:ring-2 w-full text-sm sm:text-base'
            placeholder='enter description'
            required
          ></textarea>
        </div>

        <button
          type='submit'
          className='bg-black text-white px-4 py-2 sm:py-2.5 rounded-md hover:bg-gray-800 transition-colors w-full sm:w-auto sm:self-start mt-2 text-sm sm:text-base'
        >
          submit
        </button>
      </form>
    </div>
  )
}

export default WorkspacePage;