import { Layout } from '@/components/layout/layout';

export default function AlertsPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Alerts</h1>
          <p className="text-muted-foreground">
            Alert management will be implemented here
          </p>
        </div>

        <div className="border-2 border-dashed border-border rounded-lg h-96 flex items-center justify-center">
          <p className="text-muted-foreground">
            Alert features will be implemented here
          </p>
        </div>
      </div>
    </Layout>
  );
}
