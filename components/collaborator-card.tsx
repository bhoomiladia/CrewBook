import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, MessageSquare } from "lucide-react"

interface CollaboratorCardProps {
  collaborator: {
    id: number
    name: string
    role: string
    skills: string[]
    avatar: string
    projects: number
    rating: number
  }
}

export default function CollaboratorCard({ collaborator }: CollaboratorCardProps) {
  return (
    <Card className="bg-card border-border overflow-hidden hover:border-accent transition-all duration-300 hover:shadow-lg hover:shadow-accent/20 group cursor-pointer">
      <div className="relative h-32 gradient-primary opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>

      <div className="p-6 -mt-12 relative z-10">
        <div className="flex justify-center mb-4">
          <img
            src={collaborator.avatar || "/placeholder.svg"}
            alt={collaborator.name}
            className="w-20 h-20 rounded-full border-4 border-card group-hover:scale-110 transition-transform duration-300 object-cover"
          />
        </div>

        <h3 className="font-semibold text-center text-lg mb-1">{collaborator.name}</h3>
        <p className="text-sm text-muted-foreground text-center mb-4">{collaborator.role}</p>

        <div className="flex items-center justify-center gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${i < Math.floor(collaborator.rating) ? "fill-accent text-accent" : "text-muted-foreground"}`}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-1">{collaborator.rating}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4 text-center">
          <div className="bg-background/50 rounded p-2">
            <div className="text-sm font-semibold text-accent">{collaborator.projects}</div>
            <div className="text-xs text-muted-foreground">Projects</div>
          </div>
          <div className="bg-background/50 rounded p-2">
            <div className="text-sm font-semibold text-accent">98%</div>
            <div className="text-xs text-muted-foreground">Success</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-4 justify-center">
          {collaborator.skills.slice(0, 2).map((skill) => (
            <span key={skill} className="text-xs bg-accent/10 text-accent px-2 py-1 rounded">
              {skill}
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 gradient-primary text-white border-0 text-xs hover:shadow-md hover:shadow-accent/50 transition-all duration-300"
          >
            Connect
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-border hover:bg-card hover:border-accent transition-all duration-300 bg-transparent"
          >
            <MessageSquare className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
