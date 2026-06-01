import { Table3, Badge, IconButton, type Color } from '@economic/taco';
import type { Employee, EmployeeStatus } from '../../data/mockEmployees';
import { da } from '../../data/danishCopy';

type Props = {
    employees: Employee[];
    onRowClick?: (employee: Employee) => void;
    /** Fired when the pencil icon revealed on row hover is clicked. */
    onEditClick?: (employee: Employee) => void;
};

const STATUS_COLOR: Record<EmployeeStatus, Color> = {
    pending: 'orange',
    active: 'green',
    resigned: 'grey',
};

const STATUS_LABEL: Record<EmployeeStatus, string> = {
    pending: da.status.pending,
    active: da.status.active,
    resigned: da.status.resigned,
};

function StatusBadge({ status }: { status: EmployeeStatus }) {
    return (
        <Badge color={STATUS_COLOR[status]} subtle>
            {STATUS_LABEL[status]}
        </Badge>
    );
}

export function EmployeeDraftsTable({
    employees,
    onRowClick,
    onEditClick,
}: Props) {
    return (
        <Table3<Employee>
            id="employee-drafts"
            data={employees}
            rowIdentityAccessor="id"
            enableRowClick={!!onRowClick}
            onRowClick={onRowClick}
        >
            <Table3.Column<Employee>
                accessor="employeeNumber"
                header={da.table.no}
                defaultWidth={70}
            />
            <Table3.Column<Employee>
                accessor="name"
                header={da.table.name}
                defaultWidth="grow"
            />
            <Table3.Column<Employee>
                accessor="payPeriod"
                header={da.table.payTerm}
                defaultWidth={260}
            />
            <Table3.Column<Employee>
                accessor="totalPaidYtd"
                header={da.table.totalPaidYtd}
                align="right"
                dataType="amount"
                dataTypeOptions={{ currency: 'DKK' }}
                defaultWidth={160}
            />
            <Table3.Column<Employee>
                accessor="lastPayment"
                header={da.table.lastPayment}
                defaultWidth={140}
            />
            <Table3.Column<Employee>
                accessor="remainingVacationDays"
                header={da.table.remainingVacation}
                align="right"
                dataType="number"
                dataTypeOptions={{ decimals: 2 }}
                defaultWidth={160}
            />
            <Table3.Column<Employee>
                accessor="plannedChanges"
                header={da.table.plannedChanges}
                align="center"
                defaultWidth={170}
                renderer={() => null}
            />
            <Table3.Column<Employee>
                accessor="status"
                header={da.table.status}
                align="center"
                defaultWidth={110}
                renderer={({ row }) => <StatusBadge status={row.status} />}
            />
            <Table3.Column<Employee>
                accessor="id"
                header=""
                align="right"
                defaultWidth={80}
                renderer={({ row }) => (
                    <span
                        className="inline-flex items-center gap-0.5 opacity-0 group-hover/row:opacity-100 focus-within:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <IconButton
                            icon="edit"
                            appearance="discrete"
                            aria-label={da.detailPage.edit}
                            onClick={() => onEditClick?.(row)}
                        />
                        <IconButton
                            icon="ellipsis-vertical"
                            appearance="discrete"
                            aria-label={da.actions.more}
                        />
                    </span>
                )}
            />
        </Table3>
    );
}
