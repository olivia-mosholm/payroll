import { useState } from 'react';
import { Dialog, Tabs, Field, Input, Button, Badge, Icon, type Color } from '@economic/taco';
import type { Employee, EmployeeStatus } from '../../data/mockEmployees';
import { da } from '../../data/danishCopy';

type Props = {
    employee: Employee | null;
    onClose: () => void;
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

type ScheduledChange = {
    id: string;
    value: string;
    unit: string;
    effectiveFrom: string;
};

type PayType = {
    id: string;
    code: string;
    name: string;
    currentValue: string;
    unit: string;
    schedulable?: boolean;
};

const DEFAULT_PAY_TYPES: PayType[] = [
    {
        id: 'pt-0001',
        code: '0001',
        name: 'Arbejdstimer',
        currentValue: '160,33',
        unit: 'Timer',
        schedulable: false,
    },
    {
        id: 'pt-0002',
        code: '0002',
        name: 'Månedsløn',
        currentValue: '25.000,00',
        unit: 'DKK',
        schedulable: true,
    },
];

function nextId() {
    return `sc-${Math.random().toString(36).slice(2, 9)}`;
}

function PayTypeRow({
    payType,
    expanded,
    onToggle,
    scheduledChanges,
    onAddChange,
    onRemoveChange,
}: {
    payType: PayType;
    expanded: boolean;
    onToggle: () => void;
    scheduledChanges: ScheduledChange[];
    onAddChange: (change: ScheduledChange) => void;
    onRemoveChange: (id: string) => void;
}) {
    const t = da.schedule;
    const [panelOpen, setPanelOpen] = useState(false);
    const [newValue, setNewValue] = useState('');
    const [effectiveFrom, setEffectiveFrom] = useState('');

    const handleSave = () => {
        if (!newValue.trim() || !effectiveFrom.trim()) return;
        onAddChange({
            id: nextId(),
            value: newValue.trim(),
            unit: payType.unit,
            effectiveFrom: effectiveFrom.trim(),
        });
        setNewValue('');
        setEffectiveFrom('');
        setPanelOpen(false);
    };

    const handleCancel = () => {
        setPanelOpen(false);
        setNewValue('');
        setEffectiveFrom('');
    };

    return (
        <div className="rounded border border-grey-300 bg-white">
            <button
                type="button"
                onClick={onToggle}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-neutral-50"
            >
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-neutral-900">
                        {payType.code} {payType.name}
                    </span>
                    <span className="text-xs text-neutral-500 mt-0.5">
                        {payType.currentValue} {payType.unit}
                    </span>
                </div>
                <Icon name={expanded ? 'chevron-up' : 'chevron-down'} />
            </button>

            {expanded && (
                <div className="px-4 pb-4 pt-1 border-t border-grey-200 flex flex-col gap-3">
                    <div className="flex items-center gap-2 pt-3">
                        <Input
                            defaultValue={payType.currentValue}
                            postfix={payType.unit}
                        />
                        {payType.schedulable !== false && (
                            <button
                                type="button"
                                onClick={() => setPanelOpen(true)}
                                className="inline-flex items-center gap-1 text-sm text-blue-500 hover:text-blue-700 whitespace-nowrap"
                            >
                                <Icon name="circle-plus" />
                                {t.scheduleNew}
                            </button>
                        )}
                    </div>

                    {scheduledChanges.length > 0 && (
                        <ul className="flex flex-col gap-1.5">
                            {scheduledChanges.map((c) => (
                                <li
                                    key={c.id}
                                    className="flex items-center gap-3 text-sm"
                                >
                                    <span className="font-bold text-neutral-900">
                                        {c.value}
                                    </span>
                                    <span className="text-neutral-500">
                                        {c.unit}
                                    </span>
                                    <span className="text-neutral-500">·</span>
                                    <span className="text-neutral-700">
                                        {c.effectiveFrom}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => onRemoveChange(c.id)}
                                        className="ml-auto inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700"
                                    >
                                        <Icon name="circle-minus" />
                                        {t.removeChange}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}

                    {panelOpen && (
                        <div className="border border-grey-300 bg-white rounded p-3 flex flex-col gap-3">
                            <div className="grid grid-cols-2 gap-3">
                                <Field>
                                    <span className="text-xs font-bold">
                                        {t.newValue}
                                    </span>
                                    <Input
                                        value={newValue}
                                        onChange={(e) => setNewValue(e.target.value)}
                                        postfix={payType.unit}
                                        placeholder={payType.currentValue}
                                    />
                                </Field>
                                <Field>
                                    <span className="text-xs font-bold">
                                        {t.effectiveFrom}
                                    </span>
                                    <Input
                                        value={effectiveFrom}
                                        onChange={(e) =>
                                            setEffectiveFrom(e.target.value)
                                        }
                                        placeholder={t.effectiveFromPlaceholder}
                                        icon="period"
                                    />
                                </Field>
                            </div>
                            <div className="flex items-center justify-end gap-2">
                                <Button
                                    appearance="default"
                                    onClick={handleCancel}
                                >
                                    {t.cancel}
                                </Button>
                                <Button
                                    appearance="primary"
                                    onClick={handleSave}
                                >
                                    {t.save}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function TabPlaceholder() {
    return (
        <div className="py-12 text-sm text-neutral-500 text-center">
            {da.editDialog.tabPlaceholder}
        </div>
    );
}

function StamdataTab({ employee }: { employee: Employee }) {
    const t = da.editDialog;
    const f = t.fields;
    return (
        <div className="flex flex-col gap-4 pt-4">
            <h3 className="text-sm font-bold text-neutral-900">
                {t.sectionGeneral}
            </h3>
            <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                <Field>
                    <span className="text-xs font-bold">{f.cpr}*</span>
                    <Input defaultValue={employee.cpr} />
                </Field>
                <Field>
                    <span className="text-xs font-bold">{f.fullName}*</span>
                    <Input defaultValue={employee.name} />
                </Field>
                <Field>
                    <span className="text-xs font-bold">{f.department}</span>
                    <Input defaultValue={employee.department} />
                </Field>
                <Field>
                    <span className="text-xs font-bold">{f.employeeGroup}</span>
                    <Input defaultValue={t.defaults.employeeGroup} />
                </Field>
                <Field>
                    <span className="text-xs font-bold">{f.employmentDate}*</span>
                    <Input defaultValue={employee.hireDate} />
                </Field>
                <Field>
                    <span className="text-xs font-bold">{f.employeeNumber}*</span>
                    <Input defaultValue={employee.employeeNumber} />
                </Field>
            </div>
        </div>
    );
}

function SalaryTab() {
    const t = da.schedule;
    const [payTypes] = useState<PayType[]>(DEFAULT_PAY_TYPES);
    const [expandedId, setExpandedId] = useState<string | null>('pt-0002');
    const [changesByPayType, setChangesByPayType] = useState<
        Record<string, ScheduledChange[]>
    >({});

    const handleAdd = (payTypeId: string) => (change: ScheduledChange) => {
        setChangesByPayType((prev) => ({
            ...prev,
            [payTypeId]: [...(prev[payTypeId] ?? []), change],
        }));
    };
    const handleRemove = (payTypeId: string) => (changeId: string) => {
        setChangesByPayType((prev) => ({
            ...prev,
            [payTypeId]: (prev[payTypeId] ?? []).filter((c) => c.id !== changeId),
        }));
    };

    return (
        <div className="flex flex-col gap-4 pt-4">
            <p className="text-sm text-neutral-700">{t.salaryTabIntro}</p>
            <div>
                <button
                    type="button"
                    className="inline-flex items-center gap-1 text-sm text-blue-500 hover:text-blue-700"
                >
                    <Icon name="circle-plus" />
                    {t.addPayType}
                </button>
            </div>
            <div className="flex flex-col gap-2">
                {payTypes.map((pt) => (
                    <PayTypeRow
                        key={pt.id}
                        payType={pt}
                        expanded={expandedId === pt.id}
                        onToggle={() =>
                            setExpandedId(expandedId === pt.id ? null : pt.id)
                        }
                        scheduledChanges={changesByPayType[pt.id] ?? []}
                        onAddChange={handleAdd(pt.id)}
                        onRemoveChange={handleRemove(pt.id)}
                    />
                ))}
            </div>
        </div>
    );
}

export function EmployeeEditDialogScheduleV1({ employee, onClose }: Props) {
    const open = !!employee;
    const t = da.editDialog;

    return (
        <Dialog
            open={open}
            onChange={(next) => {
                if (!next) onClose();
            }}
            size="lg"
        >
            <Dialog.Content aria-label={employee?.name ?? 'Edit employee'}>
                <Dialog.Title>
                    <span className="inline-flex items-center gap-2">
                        <span>{employee?.name ?? ''}</span>
                        {employee && (
                            <Badge color={STATUS_COLOR[employee.status]} subtle>
                                {STATUS_LABEL[employee.status]}
                            </Badge>
                        )}
                    </span>
                </Dialog.Title>

                <Tabs defaultId="salary">
                    <Tabs.List>
                        <Tabs.Trigger id="general">{t.tabs.personalInfo}</Tabs.Trigger>
                        <Tabs.Trigger id="financial">{t.tabs.employment}</Tabs.Trigger>
                        <Tabs.Trigger id="vacation">{t.tabs.vacation}</Tabs.Trigger>
                        <Tabs.Trigger id="salary">{t.tabs.salary}</Tabs.Trigger>
                        <Tabs.Trigger id="pension">{t.tabs.pension}</Tabs.Trigger>
                        <Tabs.Trigger id="options">{t.tabs.options}</Tabs.Trigger>
                    </Tabs.List>

                    <Tabs.Content id="general">
                        {employee && <StamdataTab employee={employee} />}
                    </Tabs.Content>
                    <Tabs.Content id="financial"><TabPlaceholder /></Tabs.Content>
                    <Tabs.Content id="vacation"><TabPlaceholder /></Tabs.Content>
                    <Tabs.Content id="salary"><SalaryTab /></Tabs.Content>
                    <Tabs.Content id="pension"><TabPlaceholder /></Tabs.Content>
                    <Tabs.Content id="options"><TabPlaceholder /></Tabs.Content>
                </Tabs>

                <Dialog.Footer>
                    <Button appearance="default" onClick={onClose}>
                        {t.actions.cancel}
                    </Button>
                    <Button appearance="primary" onClick={onClose}>
                        {t.actions.save}
                    </Button>
                    <Button appearance="default" onClick={onClose}>
                        {t.actions.saveNext}
                    </Button>
                </Dialog.Footer>
            </Dialog.Content>
        </Dialog>
    );
}
