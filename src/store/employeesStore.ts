import { useSyncExternalStore } from 'react';
import type { Employee } from '../data/mockEmployees';

let employees: Employee[] = [];
const listeners = new Set<() => void>();

function emit() {
    listeners.forEach((l) => l());
}

export function setEmployees(next: Employee[]) {
    employees = next;
    emit();
}

export function appendEmployees(extra: Employee[]) {
    employees = [...employees, ...extra];
    emit();
}

/**
 * Apply a partial patch to a single employee. Used by the import flow to
 * enrich existing drafts with extra fields extracted from a new document,
 * or to override individual fields when the user resolves a conflict.
 * Patched employees are flagged `enriched: true` so the detail page knows
 * to highlight the newly added fields.
 */
export function updateEmployee(id: string, patch: Partial<Employee>) {
    employees = employees.map((e) =>
        e.id === id ? { ...e, ...patch, enriched: true } : e,
    );
    emit();
}

export function clearEmployees() {
    employees = [];
    emit();
}

export function getEmployees(): Employee[] {
    return employees;
}

export function getEmployeeById(id: string): Employee | undefined {
    return employees.find((e) => e.id === id);
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export function useEmployees(): Employee[] {
    return useSyncExternalStore(subscribe, getEmployees, getEmployees);
}
