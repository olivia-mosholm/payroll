import { useState } from 'react';
import { Banner, Button, Dialog, Heading, Icon, Input, Table3, Text, Tooltip } from '@economic/taco';
import heroImg from '../../assets/hero.png';
import { type Employee } from '../../data/mockEmployees';
import { type UploadedFile } from './UploadedFilesList';
import { da } from '../../data/danishCopy';


function FieldBlock({ label, value, source = 'Lønsedler_marts_2026.pdf' }: { label: string; value?: string; source?: string }) {
    if (!value) return null;
    const [edited, setEdited] = useState(false);
    return (
        <div className="flex flex-col gap-1">
            <Text size="sm" bold>{label}</Text>
            <Input
                defaultValue={value}
                aria-label={label}
                className={edited ? undefined : 'bg-yellow-100 border-yellow-400'}
                onChange={() => setEdited(true)}
            />
            {!edited && <Text size="sm" color="secondary">{source}</Text>}
        </div>
    );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
    return (
        <h3 className="text-sm font-bold text-neutral-900 pt-2 pb-1">
            {children}
        </h3>
    );
}

function ExpandedRow({ employee }: { employee: Employee }) {
    const f = da.editDialog.fields;
    return (
        <div className="px-6 py-4 bg-neutral-50 flex flex-col gap-4">

            {/* Personal info */}
            <SectionHeader>{da.editDialog.tabs.personalInfo}</SectionHeader>
            <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                <FieldBlock label={f.cpr} value={employee.cpr} />
                <FieldBlock label={f.email} value={employee.email} />
                <FieldBlock label={f.employmentDate} value={employee.hireDate} />
                <FieldBlock label={f.fullName} value={employee.name} />
                <FieldBlock label={f.address} value={employee.address} />
                <FieldBlock label={f.postCode} value={employee.postCode} />
                <FieldBlock label={f.city} value={employee.city} />
            </div>
        </div>
    );
}

type Props = {
    open: boolean;
    onClose: () => void;
    employees: Employee[];
    files?: UploadedFile[];
};

export function EmployeeReviewDialog({ open, onClose, employees, files = [] }: Props) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const drafts = employees.filter(e => e.status === 'pending');
    const failedFiles = 0; // prototype: all files succeed
    const docsRead = files.length;
    const employeesFound = drafts.length;

    return (
        <Dialog open={open} onChange={(next) => { if (!next) onClose(); }} size="lg">
            <Dialog.Content aria-label={da.nav.employeeReview}>
                <div className="pb-3 pt-1">
                    <Heading level={2} size="md">{da.nav.employeeReview}</Heading>
                </div>

                <Banner state={failedFiles > 0 ? 'warning' : 'success'} className="mb-4">
                    <Text size="sm">
                        <strong>{docsRead} {docsRead === 1 ? 'dokument' : 'dokumenter'}</strong> læst
                        {failedFiles > 0 && <> · <strong className="text-red-600">{failedFiles} fejlede</strong></>}
                        {' · '}
                        <strong>{employeesFound} {employeesFound === 1 ? 'medarbejder' : 'medarbejdere'}</strong> fundet
                    </Text>
                </Banner>

                <Table3<Employee>
                    id="employee-review-dialog"
                    data={drafts}
                    rowIdentityAccessor="id"
                    enableRowSelection
                    selectedRows={selectedIds}
                    onRowSelect={(_rows, ids) => setSelectedIds(ids)}
                    enableRowExpansion
                    rowExpansionRenderer={(row) => () => <ExpandedRow employee={row} />}
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
                            <Tooltip
                                placement="left"
                                title={
                                    <div className="flex flex-col gap-1 p-1">
                                        <img
                                            src={heroImg}
                                            alt="Dokument preview"
                                            className="w-48 h-auto rounded object-cover"
                                        />
                                        <Text size="sm">Lønsedler_marts_2026.pdf</Text>
                                    </div>
                                }
                            >
                                <span className="flex items-center justify-center w-full h-full text-neutral-500 hover:text-neutral-900 cursor-default">
                                    <Icon name="zoom" />
                                </span>
                            </Tooltip>
                        )}
                    />
                </Table3>

                <Dialog.Footer>
                    <div className="flex items-center justify-end gap-2">
                        <Button appearance="default" onClick={onClose}>
                            Annuller
                        </Button>
                        <Button
                            appearance="primary"
                            disabled={selectedIds.length === 0}
                            onClick={onClose}
                        >
                            Opret valgte{selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}
                        </Button>
                    </div>
                </Dialog.Footer>
            </Dialog.Content>
        </Dialog>
    );
}
