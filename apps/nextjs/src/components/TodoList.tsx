import { headers } from 'next/headers'

import prisma from '@/lib/prisma'

export const TodoList = async () => {
  await headers()

  const todos = await prisma.todo.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      }
    }
  })

  if (todos.length === 0) {
    return (
      <div className="p-4">
        <p className="text-gray-500">No todos found</p>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4 container">
      <h2 className="text-2xl font-bold">Todos</h2>
      <ul className="space-y-2">
        {todos.map((todo) => (
          <li className="border rounded-lg p-4 shadow-sm" key={todo.id}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{todo.title}</h3>
                {todo.description && (
                  <p className="text-gray-600 mt-1">{todo.description}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span>By: {todo.user.name || todo.user.email}</span>
                  <span>{new Date(todo.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="ml-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    todo.isDone
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {todo.isDone ? 'Done' : 'Pending'}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
