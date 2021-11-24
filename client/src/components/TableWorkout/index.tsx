import React, { useState, useEffect } from "react";
import Table from "antd/es/table";
import Button from "antd/es/button";
import message from "antd/es/message";
import * as Scroll from "react-scroll";

import { translations } from "../utils/translations";
import { createWeeksFromDates } from "../utils/chartData";
import { createWorkout, editWorkout } from "../../redux/actions/workoutActions";
import WorkoutModal from "./WorkoutModal";
import { workoutTypes } from "./consts";
import Chart from "../Chart";
import {
  ButtonWrapper,
  OperationsWrapper,
  TableWorkoutWrapper,
  Title,
} from "./styles";
import { Workout, WorkoutState } from "../../redux/types";

type TableWorkoutProps = {
  data: WorkoutState;
  deleteRow: (id: number | string) => void;
};

function TableWorkout({ data, deleteRow }: TableWorkoutProps) {
  const [dataset, setDataSet] = useState<Map<number, number>>(
    createWeeksFromDates(data.data)
  );
  const [isChartVisible, setChartVisible] = useState(false);

  useEffect(() => {
    setDataSet(createWeeksFromDates(data.data));
  }, [data]);

  const columns = [
    {
      title: "Дистанция",
      dataIndex: "distance",
      sorter: (a: Workout, b: Workout) => a.distance - b.distance,
    },
    {
      title: "Дата",
      dataIndex: "date",
      sorter: (a: Workout, b: Workout) => +new Date(a.date) - +new Date(b.date),
    },
    {
      title: "Тип",
      dataIndex: "type",
      filters: workoutTypes.map((value: string) => ({
        text: translations[value],
        value: value,
      })),
      onFilter: (value: string, record: Workout) => record.type === value,
      render: (text: string) => translations[text],
    },
    {
      title: "Комментарий",
      dataIndex: "comment",
    },
    {
      title: "Операция",
      render: (_: string, record: Workout) => (
        <OperationsWrapper>
          <WorkoutModal workout={record} action={editWorkout}>
            <a>Редактировать</a>
          </WorkoutModal>
          <a onClick={() => deleteRow(record.id)}>Удалить</a>
        </OperationsWrapper>
      ),
    },
  ];

  const openChart = () => {
    if (data.data.length < 1) {
      message.warn("Не достаточно данных для построения графика...");
      return;
    }

    setChartVisible(!isChartVisible);
    Scroll.animateScroll.scrollToBottom();
  };

  return (
    <TableWorkoutWrapper>
      <Title>BestRunner</Title>

      <ButtonWrapper>
        <WorkoutModal action={createWorkout}>
          <Button type="primary">Добавить тренировку</Button>
        </WorkoutModal>
        <Button onClick={openChart}>Открыть график</Button>
      </ButtonWrapper>

      <Table
        columns={columns}
        dataSource={data.data}
        rowKey="id"
        pagination={false}
        bordered={true}
        loading={data.isFetching}
      />

      {isChartVisible && <Chart dataset={dataset} />}
    </TableWorkoutWrapper>
  );
}

export default TableWorkout;
