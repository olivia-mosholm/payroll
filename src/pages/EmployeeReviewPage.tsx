import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Dialog, Heading, Icon, Input, Table3, Text, Tooltip } from '@economic/taco';
import { type Employee } from '../data/mockEmployees';
import { useEmployees } from '../store/employeesStore';
import { da } from '../data/danishCopy';
import { useVariantPaths } from '../paths';

type FieldDef = { label: string; accessor: keyof Employee };

const FIELDS: FieldDef[] = [
    { label: da.editDialog.fields.cpr,            accessor: 'cpr' },
    { label: da.editDialog.fields.fullName,       accessor: 'name' },
    { label: da.editDialog.fields.email,          accessor: 'email' },
    { label: da.editDialog.fields.address,        accessor: 'address' },
    { label: da.editDialog.fields.postCode,       accessor: 'postCode' },
    { label: da.editDialog.fields.city,           accessor: 'city' },
    { label: da.editDialog.fields.salary,         accessor: 'salary' },
    { label: da.editDialog.fields.employmentDate, accessor: 'hireDate' },
];

function ExpandedRow({
    employee,
}: {
    employee: Employee;
}) {
    const fields = FIELDS.filter(f => employee[f.accessor] !== undefined);

    return (
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200">
            <div className="grid grid-cols-4 gap-x-4 gap-y-3">
                {fields.map((f) => (
                    <div key={f.accessor} className="flex flex-col gap-1">
                        <Text size="sm" bold>{f.label}</Text>
                        <Input
                            defaultValue={String(employee[f.accessor] ?? '')}
                            className="bg-yellow-100 border-yellow-400"
                            aria-label={f.label}
                        />
                        <Text size="sm" color="secondary">Lønsedler_marts_2026.pdf</Text>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function EmployeeReviewPage() {
    const navigate = useNavigate();
    const variantPaths = useVariantPaths();
    const [open, setOpen] = useState(true);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const allEmployees = useEmployees();
    const drafts = allEmployees.filter(e => e.status === 'pending');

    const handleClose = () => {
        setOpen(false);
        navigate(variantPaths.employees);
    };

    return (
        <Dialog open={open} onChange={(next) => { if (!next) handleClose(); }} size="lg">
            <Dialog.Content aria-label={da.nav.employeeReview}>
                <div className="pb-3 pt-1">
                    <Heading level={2} size="md">{da.nav.employeeReview}</Heading>
                </div>

                <Table3<Employee>
                    id="employee-review"
                    data={drafts}
                    rowIdentityAccessor="id"
                    enableRowSelection
                    selectedRows={selectedIds}
                    onRowSelect={(_rows, ids) => setSelectedIds(ids)}
                    enableRowExpansion
                    rowExpansionRenderer={(row) => () => (
                        <ExpandedRow employee={row} />
                    )}
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
                        accessor="id"
                        header="Kilde"
                        align="center"
                        defaultWidth={80}
                        renderer={({ row }) => (
                            <Tooltip content={`Lønsedler_marts_2026.pdf · ${row.employeeNumber}`}>
                                <span className="inline-flex items-center justify-center text-neutral-500 hover:text-neutral-900 cursor-default">
                                    <Icon name="zoom" />
                                </span>
                            </Tooltip>
                        )}
                    />
                </Table3>

                <Dialog.Footer>
                    <div className="flex items-center justify-end gap-2">
                        <Button appearance="default" onClick={handleClose}>
                            Annuller
                        </Button>
                        <Button
                            appearance="primary"
                            disabled={selectedIds.length === 0}
                            onClick={handleClose}
                        >
                            Opret valgte {selectedIds.length > 0 && `(${selectedIds.length})`}
                        </Button>
                    </div>
                </Dialog.Footer>
            </Dialog.Content>
        </Dialog>
    );
}
