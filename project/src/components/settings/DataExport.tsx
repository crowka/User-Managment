import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { ExportFormat, ExportCategory, downloadDataExport } from '@/lib/utils/data-export';

export function DataExport() {
  const { t } = useTranslation();
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(ExportFormat.JSON);
  const [selectedCategories, setSelectedCategories] = useState<ExportCategory[]>([ExportCategory.ALL]);
  const [includeTimestamp, setIncludeTimestamp] = useState(true);
  const [anonymize, setAnonymize] = useState(false);
  const [prettify, setPrettify] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Handle category selection
  const handleCategoryChange = (category: ExportCategory, checked: boolean) => {
    if (category === ExportCategory.ALL && checked) {
      // If "All" is selected, clear other selections
      setSelectedCategories([ExportCategory.ALL]);
    } else if (checked) {
      // Add category and remove "All" if present
      setSelectedCategories(prev => 
        [...prev.filter(c => c !== ExportCategory.ALL && c !== category), category]
      );
    } else {
      // Remove category
      setSelectedCategories(prev => prev.filter(c => c !== category));
    }
    
    // If no categories are selected, default to "All"
    if (selectedCategories.length === 0) {
      setSelectedCategories([ExportCategory.ALL]);
    }
  };
  
  // Handle export
  const handleExport = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);
      
      await downloadDataExport({
        format: selectedFormat,
        categories: selectedCategories,
        includeTimestamp,
        anonymize,
        prettify,
      });
      
      setSuccess(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to export data');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.dataExport.title')}</CardTitle>
        <CardDescription>{t('settings.dataExport.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">
              {t('settings.dataExport.success')}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Export Format */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">{t('settings.dataExport.format')}</h3>
          <RadioGroup
            value={selectedFormat}
            onValueChange={(value) => setSelectedFormat(value as ExportFormat)}
            className="grid grid-cols-2 gap-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={ExportFormat.JSON} id="json" />
              <Label htmlFor="json">JSON</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={ExportFormat.CSV} id="csv" />
              <Label htmlFor="csv">CSV</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={ExportFormat.PDF} id="pdf" />
              <Label htmlFor="pdf">PDF</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={ExportFormat.XML} id="xml" />
              <Label htmlFor="xml">XML</Label>
            </div>
          </RadioGroup>
        </div>
        
        {/* Data Categories */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">{t('settings.dataExport.categories')}</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="all"
                checked={selectedCategories.includes(ExportCategory.ALL)}
                onCheckedChange={(checked) => 
                  handleCategoryChange(ExportCategory.ALL, checked === true)
                }
              />
              <Label htmlFor="all">{t('settings.dataExport.categoryAll')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="profile"
                checked={selectedCategories.includes(ExportCategory.PROFILE)}
                onCheckedChange={(checked) => 
                  handleCategoryChange(ExportCategory.PROFILE, checked === true)
                }
                disabled={selectedCategories.includes(ExportCategory.ALL)}
              />
              <Label htmlFor="profile">{t('settings.dataExport.categoryProfile')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="activity"
                checked={selectedCategories.includes(ExportCategory.ACTIVITY)}
                onCheckedChange={(checked) => 
                  handleCategoryChange(ExportCategory.ACTIVITY, checked === true)
                }
                disabled={selectedCategories.includes(ExportCategory.ALL)}
              />
              <Label htmlFor="activity">{t('settings.dataExport.categoryActivity')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="settings"
                checked={selectedCategories.includes(ExportCategory.SETTINGS)}
                onCheckedChange={(checked) => 
                  handleCategoryChange(ExportCategory.SETTINGS, checked === true)
                }
                disabled={selectedCategories.includes(ExportCategory.ALL)}
              />
              <Label htmlFor="settings">{t('settings.dataExport.categorySettings')}</Label>
            </div>
          </div>
        </div>
        
        {/* Options */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">{t('settings.dataExport.options')}</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="timestamp"
                checked={includeTimestamp}
                onCheckedChange={(checked) => setIncludeTimestamp(checked === true)}
              />
              <Label htmlFor="timestamp">{t('settings.dataExport.includeTimestamp')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="anonymize"
                checked={anonymize}
                onCheckedChange={(checked) => setAnonymize(checked === true)}
              />
              <Label htmlFor="anonymize">{t('settings.dataExport.anonymize')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="prettify"
                checked={prettify}
                onCheckedChange={(checked) => setPrettify(checked === true)}
                disabled={selectedFormat !== ExportFormat.JSON && selectedFormat !== ExportFormat.XML}
              />
              <Label htmlFor="prettify">{t('settings.dataExport.prettify')}</Label>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleExport} disabled={isLoading}>
          {isLoading ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              {t('settings.dataExport.exporting')}
            </>
          ) : (
            t('settings.dataExport.exportButton')
          )}
        </Button>
      </CardFooter>
    </Card>
  );
} 