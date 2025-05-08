import { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/use-language";
import { translate } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { ContentRevision } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { History, ArrowLeft, Eye } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

type RevisionHistoryProps = {
  sectionType: string;
  sectionKey: string;
  language: string;
  onRestore: (content: any) => void;
};

export default function RevisionHistory({
  sectionType,
  sectionKey,
  language,
  onRestore,
}: RevisionHistoryProps) {
  const { language: currentLanguage } = useLanguage();
  const [previewRevision, setPreviewRevision] = useState<ContentRevision | null>(null);
  
  // Fetch revision history
  const { data: revisions, isLoading } = useQuery<ContentRevision[]>({
    queryKey: ["/api/content/revisions", sectionType, sectionKey, language],
    queryFn: async () => {
      const res = await fetch(`/api/content/revisions?sectionType=${sectionType}&sectionKey=${sectionKey}&language=${language}`);
      if (!res.ok) {
        throw new Error("Failed to fetch revision history");
      }
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <History className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-medium">
            {translate("admin.history", currentLanguage)}
          </h3>
        </div>
        <div className="flex justify-center p-8">
          <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!revisions?.length) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <History className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-medium">
            {translate("admin.history", currentLanguage)}
          </h3>
        </div>
        <Alert>
          <AlertDescription>
            {language === "ru" ? "История изменений пуста." : 
             language === "kz" ? "Өзгерістер тарихы бос." : 
             "Revision history is empty."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <History className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-medium">
          {translate("admin.history", currentLanguage)}
        </h3>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              {language === "ru" ? "Дата и время" : 
               language === "kz" ? "Күні мен уақыты" : 
               "Date and time"}
            </TableHead>
            <TableHead>
              {language === "ru" ? "Автор" : 
               language === "kz" ? "Автор" : 
               "Author"}
            </TableHead>
            <TableHead className="text-right">
              {language === "ru" ? "Действия" : 
               language === "kz" ? "Әрекеттер" : 
               "Actions"}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {revisions.map((revision) => (
            <TableRow key={revision.id}>
              <TableCell>
                {format(new Date(revision.createdAt), "dd.MM.yyyy HH:mm:ss")}
              </TableCell>
              <TableCell>
                {revision.createdBy ? `ID: ${revision.createdBy}` : "System"}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewRevision(revision)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  {language === "ru" ? "Просмотр" : 
                   language === "kz" ? "Қарау" : 
                   "View"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-2"
                  onClick={() => onRestore(revision.content)}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  {translate("admin.restore", currentLanguage)}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {/* Revision preview dialog */}
      {previewRevision && (
        <Dialog open={!!previewRevision} onOpenChange={() => setPreviewRevision(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                {language === "ru" ? "Просмотр версии" : 
                 language === "kz" ? "Нұсқаны қарау" : 
                 "Version preview"}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <div className="bg-muted p-4 rounded-md">
                <pre className="whitespace-pre-wrap overflow-auto max-h-96">
                  {JSON.stringify(previewRevision.content, null, 2)}
                </pre>
              </div>
              <div className="flex justify-end mt-4">
                <Button
                  onClick={() => onRestore(previewRevision.content)}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  {translate("admin.restore", currentLanguage)}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
