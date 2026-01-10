import { Layout } from '@/components/layout/layout';

export default function TokensPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Tokens</h1>
          <p className="text-muted-foreground">
            Token management will be implemented here
          </p>
        </div>

        <div className="border-2 border-dashed border-border rounded-lg h-96 flex items-center justify-center">
          <p className="text-muted-foreground">
            Token features will be implemented here
          </p>
        </div>
      </div>
    </Layout>
  );
}
