import React, { useEffect, useRef, useState } from "react";
import { BarTask } from "../../types/bar-task";
import { GanttContentMoveAction } from "../../types/gantt-task-actions";
import { Bar } from "./bar/bar";
import { BarSmall } from "./bar/bar-small";
import { Milestone } from "./milestone/milestone";
import { Project } from "./project/project";
import style from "./task-list.module.css";

export type TaskItemProps = {
  task: BarTask;
  arrowIndent: number;
  taskHeight: number;
  isProgressChangeable: boolean;
  isDateChangeable: boolean;
  isDelete: boolean;
  isSelected: boolean;
  rtl: boolean;
  onEventStart: (
    action: GanttContentMoveAction,
    selectedTask: BarTask,
    event?: React.MouseEvent | React.KeyboardEvent
  ) => any;
  dueDate?: Date;
};

export const TaskItem: React.FC<TaskItemProps> = props => {
  const {
    task,
    arrowIndent,
    isDelete,
    taskHeight,
    isSelected,
    rtl,
    onEventStart,
  } = {
    ...props,
  };
  const textRef = useRef<SVGTextElement>(null);
  const [taskItem, setTaskItem] = useState<JSX.Element>(<div />);
  const [isTextInside, setIsTextInside] = useState(true);

  useEffect(() => {
    switch (task.typeInternal) {
      case "milestone":
        setTaskItem(<Milestone {...props} />);
        break;
      case "project":
        setTaskItem(<Project {...props} />);
        break;
      case "smalltask":
        setTaskItem(<BarSmall {...props} />);
        break;
      default:
        setTaskItem(<Bar {...props} />);
        break;
    }
  }, [task, isSelected]);

  useEffect(() => {
    if (textRef.current) {
      setIsTextInside(textRef.current.getBBox().width < task.x2 - task.x1);
    }
  }, [textRef, task]);

  const getX = () => {
    const width = task.x2 - task.x1;
    const hasChild = task.barChildren.length > 0;
    if (isTextInside) {
      return task.x1 + width * 0.5;
    }
    if (rtl && textRef.current) {
      return (
        task.x1 -
        textRef.current.getBBox().width -
        arrowIndent * +hasChild -
        arrowIndent * 0.2
      );
    } else {
      return task.x1 + width + arrowIndent * +hasChild + arrowIndent * 0.2;
    }
  };
  console.log("🚀 ~ getX ~ getX:", getX())

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }
  
  return (
    <g
      className="demo"
      style={{position: "relative"}}
      onKeyDown={e => {
        switch (e.key) {
          case "Delete": {
            if (isDelete) onEventStart("delete", task, e);
            break;
          }
        }
        e.stopPropagation();
      }}
      onMouseEnter={e => {
        onEventStart("mouseenter", task, e);
      }}
      onMouseLeave={e => {
        onEventStart("mouseleave", task, e);
      }}
      onDoubleClick={e => {
        onEventStart("dblclick", task, e);
      }}
      onClick={e => {
        onEventStart("click", task, e);
      }}
      onFocus={() => {
        onEventStart("select", task);
      }}
    >
      {taskItem}
      <text
    x={getX()}
    y={task.y + taskHeight * 0.5}
    className={
      isTextInside
        ? style.barLabel
        : style.barLabel && style.barLabelOutside
    }
    ref={textRef}
  >
    {task?.name}
    {task?.dueDate && (
      <tspan x={getX()} y={task.y + taskHeight * 0.5 + 20} fill="red">
      Due: {formatDate(task.dueDate.toString())}
    </tspan>
    )}
  </text>
    </g>
  );
};


