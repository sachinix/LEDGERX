import { useCallback, useEffect, useState } from 'react'
import axiosInstance from '../api/axios.js'

function useAccounts(endpoint) {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchAccounts = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await axiosInstance.get(endpoint)
      const accountsData = response.data?.accounts || response.data || []

      const accountsWithBalance = await Promise.all(
        accountsData.map(async (account) => {
          try {
            const balanceResponse = await axiosInstance.get(`/accounts/balance/${account._id}`)
            return {
              ...account,
              balance: balanceResponse.data?.balance ?? 0,
            }
          } catch (balanceError) {
            return {
              ...account,
              balance: 0,
            }
          }
        })
      )

      setAccounts(accountsWithBalance)
    } catch (fetchError) {
      setAccounts([])
      setError(fetchError)
    } finally {
      setLoading(false)
    }
  }, [endpoint])

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  return {
    accounts,
    loading,
    error,
    refetch: fetchAccounts,
  }
}

export default useAccounts
