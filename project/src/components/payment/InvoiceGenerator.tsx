import { useState } from 'react';
import { api } from '@/lib/api/axios';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert } from '../ui/alert';
import { Download } from 'lucide-react';

interface Invoice {
  id: string;
  number: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
}

export function InvoiceGenerator() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInvoice = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.post('/invoices/generate');
      setInvoices([...invoices, response.data]);
    } catch (err) {
      setError('Failed to generate invoice');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadInvoice = async (id: string) => {
    try {
      const response = await api.get(`/invoices/${id}/download`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to download invoice');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoices</CardTitle>
      </CardHeader>
      <CardContent>
        {error && <Alert variant="destructive">{error}</Alert>}
        
        <Button
          onClick={generateInvoice}
          disabled={isLoading}
          className="mb-4"
        >
          Generate New Invoice
        </Button>

        <div className="space-y-4">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div>
                <p className="font-medium">Invoice #{invoice.number}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(invoice.date).toLocaleDateString()} - ${invoice.amount}
                </p>
                <Badge variant={
                  invoice.status === 'paid'
                    ? 'success'
                    : invoice.status === 'overdue'
                    ? 'destructive'
                    : 'secondary'
                }>
                  {invoice.status}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => downloadInvoice(invoice.id)}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}