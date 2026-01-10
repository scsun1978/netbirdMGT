import { Layout } from '@/components/layout/layout';

export default function SetupKeysPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Setup Keys</h1>
          <p className="text-muted-foreground">
            Setup key management will be implemented here
          </p>
        </div>

        <div className="border-2 border-dashed border-border rounded-lg h-96 flex items-center justify-center">
          <p className="text-muted-foreground">
            Setup key features will be implemented here
          </p>
        </div>
      </div>
    </Layout>
  );
}
