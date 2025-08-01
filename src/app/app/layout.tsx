import Navbar from '@/components/Navbar'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#F5F2EA] dark:bg-gray-900">
      <Navbar />
      <main>{children}</main>
    </div>
  )
}