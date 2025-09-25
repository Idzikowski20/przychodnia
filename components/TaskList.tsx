"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  MoreHorizontal,
  Undo2,
  CheckCircle2
} from "lucide-react";
import { Task } from "@/types/appwrite.types";
import { useState } from "react";

interface TaskListProps {
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onCreateTask: () => void;
}

export const TaskList = ({ tasks, onToggleTask, onDeleteTask, onCreateTask }: TaskListProps) => {
  const [recentlyCompleted, setRecentlyCompleted] = useState<string | null>(null);

  const handleToggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.$id === taskId);
    if (task?.completed) {
      // Jeśli zadanie było ukończone, pokaż opcję cofnięcia
      setRecentlyCompleted(taskId);
      setTimeout(() => setRecentlyCompleted(null), 5000);
    }
    onToggleTask(taskId);
  };

  const handleUndo = (taskId: string) => {
    onToggleTask(taskId);
    setRecentlyCompleted(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Lista zadań ({tasks.length})
          </CardTitle>
          <Button 
            onClick={onCreateTask}
            size="sm" 
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-1" />
            Nowe zadanie
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Ukończone zadania */}
        {completedTasks.map((task) => (
          <div key={task.$id} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <Checkbox
              checked={task.completed}
              onCheckedChange={() => handleToggleTask(task.$id)}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800 line-through">
                  {task.title}
                </span>
                <span className="text-2xl">🎉</span>
              </div>
              <p className="text-xs text-green-600 mb-2">
                Masz jeszcze 5s aby zmienić zdanie i cofnąć zanim zniknie z listy.
              </p>
              {recentlyCompleted === task.$id && (
                <Button
                  onClick={() => handleUndo(task.$id)}
                  size="sm"
                  variant="outline"
                  className="text-green-700 border-green-300 hover:bg-green-100"
                >
                  <Undo2 className="h-3 w-3 mr-1" />
                  Cofnij
                </Button>
              )}
            </div>
          </div>
        ))}

        {/* Oczekujące zadania */}
        {pendingTasks.map((task) => (
          <div key={task.$id} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50">
            <Checkbox
              checked={task.completed}
              onCheckedChange={() => handleToggleTask(task.$id)}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-900">
                  {task.title}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-6 w-6"
                  onClick={() => onDeleteTask(task.$id)}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
              {task.description && (
                <p className="text-xs text-gray-600 mb-2">{task.description}</p>
              )}
              <div className="flex items-center gap-2">
                {task.priority && (
                  <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </Badge>
                )}
                {task.dueDate && (
                  <span className="text-xs text-gray-500">
                    {formatDate(task.dueDate)}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Jeśli brak zadań */}
        {tasks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">Brak zadań do wyświetlenia</p>
            <Button 
              onClick={onCreateTask}
              size="sm" 
              variant="outline"
              className="mt-2"
            >
              <Plus className="h-4 w-4 mr-1" />
              Dodaj pierwsze zadanie
            </Button>
          </div>
        )}

        {/* Przycisk "Pokaż wszystkie" */}
        {tasks.length > 0 && (
          <div className="pt-2 border-t border-gray-200">
            <Button variant="ghost" size="sm" className="w-full text-gray-600 hover:text-gray-900">
              Pokaż wszystkie &gt;
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
