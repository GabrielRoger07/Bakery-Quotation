import { useCallback, useEffect, useMemo, useState } from 'react'
import useWebSocket from '@/hooks/useWebSocket'
import useFetch from '@/hooks/useFetch'
import Table from '@/components/data-display/Table'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import QuotationProductItem from '@/features/supplier-access/components/QuotationProductItem'
import { ENV } from '@/config/env'
import { formatMoney } from '@/utils/formatMoney'

const SupplierQuotation = ({ participationId, quotationId }) => {

  const { request } = useFetch(ENV.API_BASE_URL)

  const [quotation, setQuotation] = useState(null)
  const [participation, setParticipation] = useState(null)
  const [products, setProducts] = useState([])
  const [bids, setBids] = useState([])
  const [lowestBids, setLowestBids] = useState([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [isWinningModalOpen, setIsWinningModalOpen] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState("")
  const [searchWord, setSearchWord] = useState("")

  useEffect(() => {

    const fetchData = async () => {
      setLoading(true)

      const resQuotation = await request("GET", `/quotations/${quotationId}`)
      if(resQuotation.ok) setQuotation(resQuotation.data)

      const resParticipation = await request("GET", `/participations/${participationId}`)
      if(resParticipation.ok) setParticipation(resParticipation.data)

      const resBids = await request("GET", `/bids/participations/${participationId}`)
      if(resBids.ok) setBids(resBids.data)

      const resProducts = await request("GET", `/contains/${quotationId}`)
      setLoading(false)

      if(resProducts.ok){
        setProducts(resProducts.data)
        setError("")

        resProducts.data.forEach(async (product) => {
          const bidRes = await request("GET", `/bids/lowest?quotationId=${quotationId}&productId=${product.productId}`)
          if(bidRes.ok) setLowestBids(prev => ({...prev, [product.productId]: bidRes.data}))
        })

      }else{
        setError("Falha em carregar produtos")
      }
    }

    fetchData()

  }, [quotationId, participationId, request])

  useEffect(() => {
    if(!quotation) return

    const end = new Date(quotation.quotationEnd)

    const updateCountdown = () => {
      const now = new Date()
      const diff = end - now
      if(diff <= 0){
        setTimeRemaining("Fechado")
        return
      }

      const days = Math.floor(diff / 86400000)
      const hours = Math.floor((diff  % 86400000) / 3600000)
      const mins = Math.floor((diff % 3600000) / 60000)
      const secs = Math.floor((diff % 60000) / 1000)
      setTimeRemaining(days > 0 ? `${days}d ${hours}h ${mins}m ${secs}s` : `${hours}h ${mins}m ${secs}s`)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [quotation])

  const handleNewBid = useCallback((bid) => {

    if(bid.participationId === participationId){
      setBids(prev => [bid, ...prev])
    }

    setLowestBids(prev => {
      const currentLowest = prev[bid.productId]
      if(!currentLowest || (bid.price / (bid.quantity + bid.bonus)) < (currentLowest.price / (currentLowest.quantity + currentLowest.bonus))){
        return {...prev, [bid.productId]: bid }
      }
      return prev
    })
  }, [participationId])

  useWebSocket(quotationId, handleNewBid)

  const bidColumns = useMemo(() => [
    { key: "productName", label: "Produto" },
    { key: "quantity", label: "Quantidade" },
    { key: "bonus", label: "Bônus" },
    { key: "price", label: "Preço Total" },
    { key: "pricePerUnit", label: "Preço Unitário" },
    { key: "createdAt", label: "Data/Hora" },
    { key: "status", label: "Status" }
  ], [])

  const formattedBids = bids.map(b => {

    const lowestBid = lowestBids[b.productId]
    const isLowest = lowestBid && lowestBid.participationId === b.participationId && lowestBid.price === b.price

    return {
      ...b,
      price: formatMoney(b.price),
      pricePerUnit: formatMoney(b.price / (b.quantity + b.bonus)),
      createdAt: new Date(b.createdAt).toLocaleString(),
      status: isLowest
          ? <span className="text-[var(--color-success)] font-semibold">Vencendo</span>
          : <span className="text-[var(--color-danger)] font-semibold">Superado</span>
    }
  })

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchWord.trim().toLowerCase()
    if(!normalizedSearch) return products
    return products.filter(product => product.productName?.toLowerCase().includes(normalizedSearch))
  }, [products, searchWord])

  const winningCount = Object.values(lowestBids).filter(
    bid => bid && bid.participationId === participationId
  ).length

  const totalWinningValue = Object.values(lowestBids)
    .filter(bid => bid && bid.participationId === participationId)
    .reduce((sum, bid) => sum + bid.price, 0)

  if(loading) return <p>Carregando produtos...</p>
  if(error) return <p>{error}</p>
  if(!products.length) return <p>Nenhum produto encontrado para essa cotação</p>

  return (
      <div className="page-wrapper text-[var(--color-text-primary)]">
        <h2 className="text-[var(--color-text-strong)] text-[1.25rem] m-0">
            Cotação {new Date(quotation.quotationStart).toLocaleDateString("pt-BR")} - #{quotationId}
        </h2>

        {participation?.supplierName && (
          <p className="text-[1.125rem] text-[var(--color-text-muted)] mb-[0.7rem] mt-[0.3rem]">Fornecedor: {participation.supplierName}</p>
        )}

        {quotation && (
          <div className="flex justify-center items-center gap-[1.3rem] bg-[var(--color-surface-0)] border border-[var(--color-border)] [box-shadow:var(--shadow-xs)] px-[0.9rem] py-[0.68rem] rounded-[var(--radius-md)] mb-[0.9rem] text-[1rem] text-[var(--color-text-secondary)] w-full max-[768px]:flex-col max-[768px]:items-start max-[768px]:gap-[0.4rem]">
            <p className="m-0 text-[1rem]"><strong className="text-[1.125rem] text-[var(--color-text-strong)]">Início:</strong> {new Date(quotation.quotationStart).toLocaleString()}</p>
            <p className="m-0 text-[1rem]"><strong className="text-[1.125rem] text-[var(--color-text-strong)]">Fim:</strong> {new Date(quotation.quotationEnd).toLocaleString()}</p>
          </div>
        )}

        <div className="flex items-center justify-between gap-4 w-full bg-[var(--color-surface-0)] px-4 py-[0.88rem] border border-[var(--color-border)] rounded-[var(--radius-lg)] [box-shadow:var(--shadow-xs)] mb-[1.1rem] max-[768px]:flex-col max-[768px]:items-start max-[768px]:gap-3">
          <p className="m-0 text-[1rem] font-medium text-[var(--color-text-secondary)]">Total de Produtos: <strong>{products.length}</strong></p>
          {timeRemaining && <p className="m-0 text-[1rem] font-medium text-[var(--color-text-secondary)]">Tempo Restante: {timeRemaining}</p>}
          <div className="flex items-center gap-[0.7rem]">
            <span className="font-semibold text-[var(--color-success-strong)]">
              Vencendo: {winningCount}/{products.length}
            </span>
            <Button onClick={() => setIsWinningModalOpen(true)}>Visualizar</Button>
          </div>
        </div>

        <div className="w-full bg-[var(--color-surface-0)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 mb-4 [box-shadow:var(--shadow-xs)]">
          <div className="flex gap-3 items-end max-[768px]:flex-col max-[768px]:items-stretch">
            <div className="flex-1 min-w-[200px] [&_.input-container]:mb-0 max-[768px]:min-w-0">
              <Input
                type="text"
                value={searchWord}
                onChange={e => setSearchWord(e.target.value)}
                placeholder={"Digite o campo"}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(315px,100%),1fr))] gap-4 w-full mx-auto items-stretch">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <QuotationProductItem key={product.productId} product={product} participationId={participationId} currentLowestBid={lowestBids[product.productId] || null} />
            ))
          ) : (
            <p>Nenhum produto disponível</p>
          )}
        </div>

        <div className="mt-6 w-full">
          <Table title={"Seus Lances"} columns={bidColumns} data={formattedBids} loading={loading} emptyMessage={"Você ainda não tem nenhum lance."}/>
        </div>

        <Modal isOpen={isWinningModalOpen} onClose={() => setIsWinningModalOpen(false)} title={"Lances Vencedores"}>
          <div>
            {winningCount > 0 ? (
              <>
              <ul className="list-none p-0 m-0">
                {Object.entries(lowestBids)
                  .filter(([, bid]) => bid && bid.participationId === participationId)
                  .map(([productId, bid]) => {
                    const product = products.find(p => p.productId === Number(productId))
                    const pricePerUnit = bid.price / (bid.quantity + bid.bonus)
                    return (
                      <li key={productId} className="py-2 border-b border-[var(--color-border-lighter)] last:border-b-0 text-[1rem] text-[var(--color-text-secondary)]">
                        <strong>{product?.productName}</strong>
                        {' '}- {formatMoney(bid.price)} - {formatMoney(pricePerUnit)}/UN
                      </li>
                    )
                  })
                }
              </ul>
              <div className="mt-[0.8rem] px-[0.65rem] py-[0.65rem] bg-[var(--color-highlight-lighter)] border border-[var(--color-highlight-border)] rounded-[var(--radius-md)] text-[1rem] text-[var(--color-text-strong)] text-center">
                <strong>Valor Total: </strong>{formatMoney(totalWinningValue)}
              </div>
              </>
            ) : (
              <p>Você não está vencendo nenhum produto agora.</p>
            )}
          </div>
        </Modal>
      </div>
    )
}

export default SupplierQuotation
