import RequireMember from '@/components/RequireMember'
import BoardClient from './BoardClient'

export default function BoardPage() {
  return (
    <RequireMember>
      <BoardClient />
    </RequireMember>
  )
}
