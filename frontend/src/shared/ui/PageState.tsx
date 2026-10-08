import { Alert, Empty, Spin } from "antd";


export function PageState({
  loading,
  error,
  empty,
  emptyText = "Данных пока нет",
  children,
}: {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyText?: string;
  children: React.ReactNode;
}) {
  if (loading) {
    return (
      <div className="page-state">
        <Spin tip="Загрузка данных" />
      </div>
    );
  }
  if (error) {
    return <Alert type="error" showIcon message="Ошибка" description={error} />;
  }
  if (empty) {
    return (
      <div className="page-state">
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyText} />
      </div>
    );
  }
  return children;
}
