import Link from "next/link"
import { Package, Boxes, ArrowLeftRight, Users, Settings, Building2, LayoutDashboard } from "lucide-react"

type Props = {
    locale: string
    userRole?: string
}

export function Sidebar({ locale, userRole }: Props) {
    const base = `/${locale}/dashboard`
    const isAdmin = userRole === 'ADMIN'

    return (
        <aside className="w-64 border-r bg-white dark:bg-slate-800 dark:border-slate-700">
            <div className="p-4 font-semibold text-slate-900 dark:text-slate-100">Inventory</div>

            <nav className="px-2 space-y-1">
                <Link
                    href={`${base}`}
                    className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                    >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                </Link>

                <Link
                    href={`${base}/inventory`}
                    className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                    >
                    <Boxes className="h-4 w-4" />
                    Inventory
                </Link>

                <Link
                    href={`${base}/products`}
                    className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                    >
                    <Package className="h-4 w-4" />
                    Products
                </Link>

                <Link
                    href={`${base}/movements`}
                    className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                    >
                    <ArrowLeftRight className="h-4 w-4" />
                    Movements
                </Link>

                {isAdmin && (
                    <>
                        <div className="mt-6 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                            Administración
                        </div>
                        <Link
                            href={`${base}/admin/users`}
                            className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                        >
                            <Users className="h-4 w-4" />
                            Usuarios
                        </Link>
                        <Link
                            href={`${base}/user-warehouses`}
                            className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                        >
                            <Building2 className="h-4 w-4" />
                            Asignar Almacenes
                        </Link>
                        <Link
                            href={`${base}/admin/settings`}
                            className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                        >
                            <Settings className="h-4 w-4" />
                            Configuración
                        </Link>
                    </>
                )}
            </nav>
        </aside>
    )
}