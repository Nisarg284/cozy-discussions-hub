
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';

interface PostPaginationProps {
  after: string | null;
  before: string | null;
  onLoadMore: (direction: 'next' | 'prev') => void;
  hasMore: boolean;
  isLoading: boolean;
}

const PostPagination = ({ after, before, onLoadMore, hasMore, isLoading }: PostPaginationProps) => {
  return (
    <div className="w-full flex justify-center my-6">
      {isLoading ? (
        <Button disabled variant="outline" className="animate-pulse">
          Loading...
        </Button>
      ) : (
        <Pagination>
          <PaginationContent>
            {before && (
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    onLoadMore('prev');
                  }} 
                />
              </PaginationItem>
            )}
            
            {hasMore && (
              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    onLoadMore('next');
                  }} 
                />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default PostPagination;
