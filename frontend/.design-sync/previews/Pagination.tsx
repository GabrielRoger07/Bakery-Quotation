import { Pagination } from '@bakery/design-system'

export const Middle = () => (
  <Pagination currentPage={2} totalPages={8} onPageChange={() => {}} />
)

export const FirstPage = () => (
  <Pagination currentPage={1} totalPages={3} onPageChange={() => {}} />
)
