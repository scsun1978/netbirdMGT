import { Layout } from '@/components/layout/layout';

export default function AuditPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Audit</h1>
          <p className="text-muted-foreground">
            Audit logs will be implemented here
          </p>
        </div>

        <div className="border-2 border-dashed border-border rounded-lg h-96 flex items-center justify-center">
          <p className="text-muted-foreground">
            Audit features will be implemented here
          </p>
        </div>
      </div>
    </Layout>
  );
}
