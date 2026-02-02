import { WarehouseSwitcher } from "./warehouse-switcher"
import { UserMenu } from "./user-menu"

type Warehouse = {id: string; name: string; code: string}
type User = {name: string | null; email: string | null; role: string}

export function DashboardHeader ({
    warehouses,
    activeWarehouseId,
    user,
    locale,
}: {
    warehouses: Warehouse[]
    activeWarehouseId: string | null
    user: User
    locale: string
}) {
    return (
        <header className="flex items-center justify-between p-4 border-b bg-white dark:bg-slate-800 dark:border-slate-700 px-6 py-4">
            <div className="font-semibold text-lg text-slate-900 dark:text-slate-100">Inventory System</div>
            <div className="flex items-center gap-4">
                <WarehouseSwitcher warehouses={warehouses} activeWarehouseId={activeWarehouseId} />
                <UserMenu user={user} locale={locale} />
            </div>
        </header>
    )
}