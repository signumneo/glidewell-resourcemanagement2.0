import { create } from 'zustand';
import { mainProcesses as initialMainProcesses, type MainProcess, type Subprocess } from '../data/hierarchicalProcessData';

interface ProcessState {
  mainProcesses: MainProcess[];
  addSubprocess: (mainProcessId: string, subprocess: Omit<Subprocess, 'id'>) => void;
  updateSubprocess: (mainProcessId: string, subprocessId: string, updates: Partial<Subprocess>) => void;
  deleteSubprocess: (mainProcessId: string, subprocessId: string) => void;
}

export const useProcessStore = create<ProcessState>((set) => ({
  mainProcesses: initialMainProcesses,
  
  addSubprocess: (mainProcessId, subprocess) =>
    set((state) => {
      const mainProcess = state.mainProcesses.find(mp => mp.id === mainProcessId);
      if (!mainProcess) return state;

      // Generate proper ID based on process prefix
      const prefix = mainProcess.subprocesses.length > 0 
        ? mainProcess.subprocesses[0].id.split('-')[0] 
        : mainProcessId.substring(0, 3).toUpperCase();
      
      // Find highest number in existing IDs
      const existingNumbers = mainProcess.subprocesses
        .map(sp => {
          const parts = sp.id.split('-');
          return parts.length > 1 ? parseInt(parts[1]) : 0;
        })
        .filter(num => !isNaN(num));
      
      const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
      const newNumber = maxNumber + 1;
      const newId = `${prefix}-${String(newNumber).padStart(3, '0')}`;

      return {
        mainProcesses: state.mainProcesses.map((mp) =>
          mp.id === mainProcessId
            ? {
                ...mp,
                subprocesses: [
                  ...mp.subprocesses,
                  {
                    ...subprocess,
                    id: newId,
                  },
                ],
              }
            : mp
        ),
      };
    }),

  updateSubprocess: (mainProcessId, subprocessId, updates) =>
    set((state) => ({
      mainProcesses: state.mainProcesses.map((mp) =>
        mp.id === mainProcessId
          ? {
              ...mp,
              subprocesses: mp.subprocesses.map((sp) =>
                sp.id === subprocessId ? { ...sp, ...updates } : sp
              ),
            }
          : mp
      ),
    })),

  deleteSubprocess: (mainProcessId, subprocessId) =>
    set((state) => ({
      mainProcesses: state.mainProcesses.map((mp) =>
        mp.id === mainProcessId
          ? {
              ...mp,
              subprocesses: mp.subprocesses.filter((sp) => sp.id !== subprocessId),
            }
          : mp
      ),
    })),
}));
