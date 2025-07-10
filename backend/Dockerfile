FROM golang:1.24.3-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /bin/app ./main.go

FROM alpine:latest
WORKDIR /app
COPY --from=builder /bin/app /app/app
EXPOSE 8585
CMD ["/app/app"]