"use client";

import { useEffect, useState } from "react";
import { useTaskopiaAPI } from "./providers/taskopia-api";
import { User } from "./model";

export default function Home() {
  const taskopiaAPI = useTaskopiaAPI()

  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)


  useEffect(() => {
    async function fetchUser() {
      setIsLoading(true)
      try {
        const user = await taskopiaAPI.getCurrentUser()
        setUser(user)
      } catch (error) {
        console.error(error)
      }
      setIsLoading(false)
    }

    fetchUser()
  }, [])

  return (
    <>
      <header>
        <h1
          className="text-4xl font-bold text-center p-8 bg-gradient-to-r from-blue-400 to-blue-600 text-transparent bg-clip-text"
        >Taskopia!</h1>
        {isLoading && <p>Loading...</p>}
        {user && <p className="text-center p-4 bg-gradient-to-r from-blue-400 to-blue-600 text-transparent bg-clip-text"        >Welcome, {user.name}!</p>}
      </header>
      <main className="flex min-h-screen flex-col items-center justify-between p-24">

        <section>

        </section>

      </main>
    </>
  )
}
