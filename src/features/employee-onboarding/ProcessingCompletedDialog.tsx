import { useState } from 'react';
import { Badge, Button, Dialog, Heading, Input, List, Text, type Color } from '@economic/taco';
import type { Employee } from '../../data/mockEmployees';
import type { UploadedFile } from './UploadedFilesList';
import { da } from '../../data/danishCopy';

type Props = {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    files: UploadedFile[];
    employees: Employee[];
};

type FieldRow = { label: string; value: string; source: string };

function getFields(employee: Employee, sourceFile: string): FieldRow[] {
    const rows: FieldRow[] = [
        { label: da.editDialog.fields.cpr, value: employee.cpr, source: sourceFile },
        { label: da.editDialog.fields.fullName, value: employee.name, source: sourceFile },
    ];
    if (employee.email) rows.push({ label: da.editDialog.fields.email, value: employee.email, source: sourceFile });
    if (employee.address) rows.push({ label: da.editDialog.fields.address, value: employee.address, source: sourceFile });
    if (employee.postCode) rows.push({ label: da.editDialog.fields.postCode, value: employee.postCode, source: sourceFile });
    if (employee.city) rows.push({ label: da.editDialog.fields.city, value: employee.city, source: sourceFile });
    rows.push({ label: da.editDialog.fields.salary, value: `${employee.salary.toLocaleString('da-DK')} kr.`, source: sourceFile });
    rows.push({ label: da.editDialog.fields.employmentDate, value: employee.hireDate, source: sourceFile });
    return rows;
}

type ItemStatus = 'default' | 'created' | 'deleted';

function EmployeeListItem({
    employee,
    sourceFile,
    onRemove,
    onConfirm,
}: {
    employee: Employee;
    sourceFile: string;
    onRemove: () => void;
    onConfirm: () => void;
}) {
    const [status, setStatus] = useState<ItemStatus>('default');
    const fields = getFields(employee, sourceFile);

    const iconColor: Color =
        status === 'created' ? 'green' :
        status === 'deleted'  ? 'red'   :
        'blue';

    const statusLabel =
        status === 'created' ? <Text size="sm" color="success" as="span"> (oprettet)</Text> :
        status === 'deleted'  ? <Text size="sm" color="danger"  as="span"> (slettet)</Text>  :
        null;

    const isLocked = status !== 'default';

    return (
        // key forces remount (and thus collapse) whenever status changes
        <List.Collapsible
            key={status}
            title={<span className="font-semibold">{employee.name}{statusLabel}</span>}
            description={`${fields.length} felter udfyldt · 1 kilde`}
            icon="person"
            color={iconColor}
            defaultOpen={false}
            control={
                status === 'created' ? <Badge color="green" subtle>Oprettet</Badge> :
                status === 'deleted'  ? <Badge color="red"   subtle>Slettet</Badge>  :
                undefined
            }
        >
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 px-4 pt-2 pb-1">
                {fields.map((f, i) => (
                    <div key={i} className="flex flex-col gap-1">
                        <Text size="sm" bold>{f.label}</Text>
                        <Input
                            defaultValue={f.value}
                            disabled={isLocked}
                            className={isLocked ? undefined : 'bg-yellow-100 border-yellow-400'}
                            aria-label="Udtrukket af AI"
                        />
                        <Text size="sm" color="secondary">{f.source}</Text>
                    </div>
                ))}
            </div>
            <div className="flex items-center justify-end gap-2 px-4 pt-4 pb-3">
                <Button appearance="default" disabled={isLocked} onClick={() => { setStatus('deleted'); onRemove(); }}>
                    Fjern medarbejder
                </Button>
                <Button appearance="default" disabled={isLocked}>
                    Gem som kladde
                </Button>
                <Button
                    appearance="primary"
                    disabled={isLocked}
                    onClick={() => setStatus('created')}
                >
                    Opret medarbejder
                </Button>
            </div>
        </List.Collapsible>
    );
}

export function ProcessingCompletedDialog({
    open,
    onClose,
    onConfirm,
    files,
    employees,
}: Props) {
    const [list, setList] = useState<Employee[]>([]);
    const effectiveList = open && list.length === 0 && employees.length > 0 ? employees : list;

    const pairs = effectiveList.map((emp, i) => ({
        employee: emp,
        sourceFile: files.length > 0 ? files[i % files.length].name : 'Dokument',
    }));

    return (
        <Dialog
            open={open}
            onChange={(next) => {
                if (!next) { onClose(); setList([]); }
                else if (employees.length > 0 && list.length === 0) setList(employees);
            }}
            size="md"
        >
            <Dialog.Content aria-label={da.processedDialog.titleN(pairs.length)}>
                <div className="pb-3 pt-1">
                    <Heading level={2} size="md">
                        {da.processedDialog.titleN(pairs.length)}
                    </Heading>
                </div>

                <List>
                    {pairs.map((p) => (
                        <EmployeeListItem
                            key={p.employee.id}
                            employee={p.employee}
                            sourceFile={p.sourceFile}
                            onRemove={() => {}}
                            onConfirm={onConfirm}
                        />
                    ))}
                </List>

                <Dialog.Footer>
                    <div className="flex items-center justify-end gap-2">
                        <Button appearance="default" onClick={() => { onClose(); setList([]); }}>
                            Annuller
                        </Button>
                        <Button appearance="primary" onClick={() => { onConfirm(); setList([]); }}>
                            Opret valgte
                        </Button>
                    </div>
                </Dialog.Footer>
            </Dialog.Content>
        </Dialog>
    );
}
