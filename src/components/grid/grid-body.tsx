import React, { ReactChild } from "react";
import { MemberBooking, Task } from "../../types/public-types";
import { addToDate } from "../../helpers/date-helper";
import styles from "./grid.module.css";

const getMemberBookingRectProps = (task: { x1: any; x2: any; totalHours: number; y: number; index: number; height: number; }, memberBooking: { hoursBooked: number; }) => {
  const startX = task.x1; // Assuming x1 is the start position of the task
  const endX = task.x2; // Assuming x2 is the end position of the task
  const taskWidth = endX - startX;
  const bookedWidth = (memberBooking.hoursBooked / task.totalHours) * taskWidth; // Calculate width based on hours booked
  
  return {
    x: startX, // Position the rectangle at the start of the task
    y: task.y + task.index * (task.height + 5), // Position vertically based on task's Y position and index
    width: bookedWidth, // Width based on the booked hours
    height: task.height, // Height to match the task bar's height
  };
};

export type GridBodyProps = {
  tasks: Task[];
  dates: Date[];
  svgWidth: number;
  rowHeight: number;
  columnWidth: number;
  todayColor: string;
  rtl: boolean;
};
export const GridBody: React.FC<GridBodyProps> = ({
  tasks,
  dates,
  rowHeight,
  svgWidth,
  columnWidth,
  todayColor,
  rtl,
}) => {
  let y = 0;
  const gridRows: ReactChild[] = [];
  const rowLines: ReactChild[] = [
    <line
      key="RowLineFirst"
      x="0"
      y1={0}
      x2={svgWidth}
      y2={0}
      className={styles.gridRowLine}
    />,
  ];
  for (const task of tasks) {
    gridRows.push(
      <rect
        key={"Row" + task.id}
        x="0"
        y={y}
        width={svgWidth}
        height={rowHeight}
        className={styles.gridRow}
      />
    );
    rowLines.push(
      <line
        key={"RowLine" + task.id}
        x="0"
        y1={y + rowHeight}
        x2={svgWidth}
        y2={y + rowHeight}
        className={styles.gridRowLine}
      />
    );
    y += rowHeight;
  }

  const now = new Date();
  let tickX = 0;
  const ticks: ReactChild[] = [];
  let today: ReactChild = <rect />;
  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    ticks.push(
      <line
        key={date.getTime()}
        x1={tickX}
        y1={0}
        x2={tickX}
        y2={y}
        className={styles.gridTick}
      />
    );
    if (
      (i + 1 !== dates.length &&
        date.getTime() < now.getTime() &&
        dates[i + 1].getTime() >= now.getTime()) ||
      // if current date is last
      (i !== 0 &&
        i + 1 === dates.length &&
        date.getTime() < now.getTime() &&
        addToDate(
          date,
          date.getTime() - dates[i - 1].getTime(),
          "millisecond"
        ).getTime() >= now.getTime())
    ) {
      today = (
        <rect
          x={tickX}
          y={0}
          width={columnWidth}
          height={y}
          fill={todayColor}
        />
      );
    }
    // rtl for today
    if (
      rtl &&
      i + 1 !== dates.length &&
      date.getTime() >= now.getTime() &&
      dates[i + 1].getTime() < now.getTime()
    ) {
      today = (
        <rect
          x={tickX + columnWidth}
          y={0}
          width={columnWidth}
          height={y}
          fill={todayColor}
        />
      );
    }
    tickX += columnWidth;
  }

  const renderMemberBookings = (task: any) => {
    if (!task.memberBookings) return null;

    return task.memberBookings.map((memberBooking : MemberBooking) => {
      const { x, y, width, height } = getMemberBookingRectProps(task, memberBooking);
      return (
        <rect
          key={`${task.id}-member-${memberBooking.memberId}`}
          x={x}
          y={y}
          width={width}
          height={height}
          fill="rgba(0, 123, 255, 0.5)" // Example fill color, you can customize it
          className="memberBooking"
        />
      );
    });
  };

  return (
    <g className="gridBody">
      <g className="rows">{gridRows}</g>
      <g className="rowLines">{rowLines}</g>
      <g className="ticks">{ticks}</g>
      <g className="today">{today}</g>
      {tasks.map((task) => (
        <g key={task.id}>
          {renderMemberBookings(task)}
        </g>
      ))}
    </g>
  );
}