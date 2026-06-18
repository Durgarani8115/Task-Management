import React from 'react'

export interface Task{
    title: string;
}

export const taskPopup = () => {
  return (
    <div>
        <Form>
            <label htmlFor=""></label>
<input type="text" />
<input type="text" className="textarea" />
<input type="date" className="date" />
        </Form>
    </div>
  )
}
